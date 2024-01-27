#!C:/Strawberry/perl/bin/perl.exe

use strict;
use warnings;
use JSON;
use CGI qw(:standard);
use CGI::Carp qw(fatalsToBrowser);
use DBI;
use Crypt::SaltedHash;
use CGI::Cookie;
use CGI::Session;




# Create CGI object
my $cgi = CGI->new();

my $json_data = decode_json_environmental_variables( "../.env.json");

# Read the JSON file

sub decode_json_environmental_variables {

my $json_environmental_variables = shift;

open my $json_file_handler, 
'<', $json_environmental_variables  
or die "Failed to open $json_environmental_variables : $!";
my $json_data;
{
    local $/;
    $json_data = <$json_file_handler>;
}
close $json_file_handler;
return $json_data;
}


# Parse the JSON data
my $configuration_data = decode_json($json_data);

# Access the stored values
my $dsn = $configuration_data->{dsn};
my $username = $configuration_data->{username};
my $password = $configuration_data->{password};

# Connect to the database
my $dbh = DBI->connect($dsn, $username, $password) or die("Error connecting to the database: $DBI::errstr\n");

my $request = $cgi->param('POSTDATA');

my $request_body;
if ($request){
$request_body = decode_json($request)
};

my $action = $request_body ->{action};
my $is_password_valid; #Global variable 
my @json_data; # Global array to store JSON data

if($action eq "sign in user"){
validate_user_login();
if($is_password_valid){

if($action eq "create color data"){
    &insert_color_data($dbh);
} elsif($action eq "create user"){
    insert_user_data();
}
    else{
    main_load();
}
}
}else{
    print_json({"error"=>"Please Login"})
}


sub validate_user_login{
    my $user_name = $request_body->{username_input};
    my $password  = $request_body->{password_input}; 
  
    my $user_data_select_query = "
        SELECT  
        USER_NAME, SALTED_HASH_OBJECT
        FROM user_data_table
        WHERE USER_NAME = ?
    ";

    my $user_data_select_statement = $dbh->prepare($user_data_select_query);

    unless ($user_data_select_statement->execute($user_name)) {
        die "Error in SQL query: " . $user_data_select_statement->errstr;
    }

 
    my ($db_user_name, $db_salted_hash_object) = $user_data_select_statement->fetchrow_array();

    if($user_name eq $db_user_name){

  validate_password($password, $db_salted_hash_object, $db_user_name);
    }else{
          print_json({"error" => "The username $user_name does not exist"});
          return
    }
   

}

sub validate_password {
    my ($input_password, $db_salted_hash_object, $logged_user_name) = @_;
   

   my $salted_object = Crypt::SaltedHash->new(algorithm => 'SHA-1');

    # Validate the entered password against the stored salted hash
    $is_password_valid = $salted_object->validate( $db_salted_hash_object, $input_password);
    if ($is_password_valid) {
       my $session_cookie = generate_cookie();
       set_cookie($session_cookie);
       print_json({"success" => "Login $session_cookie successful" , "isLogin" => $is_password_valid});
    } else {
        print_json({"error" => "Invalid login details",  "isLogin" => $is_password_valid});
    } 
return $is_password_valid;
}

sub insert_user_data {
    my $first_name = $request_body->{firstname_input};
    my $surname    = $request_body->{lastname_input};
    my $user_name  = $request_body->{username_input};
    my $email      = $request_body->{email_input};

    my $salted_hashed_password_object = generate_hashed_password();

    my $user_data_insert_query = "
        INSERT INTO user_data_table 
        (FIRST_NAME, SURNAME, EMAIL, USER_NAME, SALTED_HASH_OBJECT) 
        VALUES (?, ?, ?, ?, ?)
    ";

    my $user_data_insert_statement = $dbh->prepare($user_data_insert_query);

    if ($user_data_insert_statement->execute($first_name, $surname, $email, $user_name, $salted_hashed_password_object)) {
        print_json({"success" => "User data inserted successfully"});
    } else {
        print_json({"error" => "Error in SQL query: " . $user_data_insert_statement->errstr});
    }
}


sub insert_color_data {
# Get form data
my $color_name = $request_body ->{color};
my $color_meaning = $request_body ->{colorMeaning};
my $color_memories = $request_body ->{colorMemories};


    my $dbh = shift;

    if (not defined $color_name or $color_name eq '') {
        print_json({"Error" => "Please provide a color name"});
        die "Error: Please provide a color name\n";
    }

    my $insert_query = "INSERT INTO color_table (COLOR_NAME, COLOR_MEANING, COLOR_MEMORIES) VALUES (?, ?, ?)";
    my $insert_stmt = $dbh->prepare($insert_query);

    if (not $insert_stmt) {
        die "Error: Unable to prepare SQL: " . $dbh->errstr . "\n";
    }

    $insert_stmt->execute($color_name, $color_meaning, $color_memories);

    if ($insert_stmt->err) {
        die "Error: " . $insert_stmt->errstr . "\n";
    }
    print_json({"Success" => "The Color $color_name has been inserted successfuly"});
}



# Handle DELETE request
sub delete_color_data {
    my ($cgi, $dbh, $color_id) = @_;

    if ($cgi->request_method() eq 'DELETE') {
        if ($color_id) {
            my $delete_query = "DELETE FROM color_table WHERE id = ?";
            my $delete_stmt = $dbh->prepare($delete_query);
            $delete_stmt->execute($color_id) or die "Unable to execute SQL: $delete_stmt->errstr";
        }
    }
}

my $color_id = $cgi->param('id');
delete_color_data($cgi, $dbh, $color_id);

# Retrieve color data from MySQL database
sub get_last_ten_colors {
    my ($dbh) = @_;

    my $select_query = qq(
        SELECT 
            ID,
            COLOR_NAME, 
            COLOR_MEANING, 
            COLOR_MEMORIES,
            (SELECT COUNT(main.COLOR_NAME) FROM color_table as main WHERE main.COLOR_NAME = tbls.COLOR_NAME) as color_count
        FROM color_table as tbls
        ORDER BY id DESC
        LIMIT 10
    );

     my $select_stmt = $dbh->prepare($select_query);
    die "Error in preparing query: " . $dbh->errstr if !$select_stmt;
    
    $select_stmt->execute();
    die "Error in executing query: " . $select_stmt->errstr if $select_stmt->err;

    my @last_ten_colors;

    while (my @daten = $select_stmt->fetchrow_array()) {
        push(@last_ten_colors, {
            "color_id"      => $daten[0],
            "color_name"    => $daten[1],
            "color_meaning" => $daten[2],
            "color_memories" => $daten[3],
            "color_count"   => $daten[4]
        });
    }

    $select_stmt->finish(); 

# my %color_data = ("color_object" => \@last_ten_colors); 
#my $json = encode_json \%color_data;
  print_json ({"color_object" => \@last_ten_colors});

}



sub generate_hashed_password {

    my $user_password = $request_body->{password_input};
    my $is_user_created_value = "1";

    # Check if the username already exists
    my $check_username_query = "SELECT USER_NAME FROM user_data_table WHERE USER_NAME = ?";
    my $username_exists = $dbh->selectrow_array($check_username_query, undef, $username);

    if ($username_exists) {
        print_json({"error" => "Username already exists"});
        return;
    }

    # Create a salted hash of the password
    my $salted_object = Crypt::SaltedHash->new(algorithm => 'SHA-1');
    $salted_object->add($user_password);
    my $hashed_password = $salted_object->generate;

    print_json({"success" => "User created successfully", "isUserCreated" => $is_user_created_value});


    return $hashed_password;
}


sub generate_cookie {
    

    # Create a new CGI::Session object
    my $session = CGI::Session->new( 'driver:File', undef, { Directory => '/tmp' } ) or die CGI::Session->errstr;

    # Get the session ID
    my $session_id = $session->id();

    # Create the cookie using the session ID as the name
    my $session_cookie = $cgi->cookie(
         -name     => 'CGISESSID',
        -value    => $session_id,
        -expires  => '+3M',
        -secure   => 1,
        -samesite => 'Lax',
        -priority => 'High',
        -httponly => 1,
    );

    return $session_cookie;
}


sub set_cookie{
    print "Content-Type: text/html\n\n";
my $session_cookie = shift;
print header(-cookie=>$session_cookie);
}

sub main_load{
    #print "Content-Type: text/html\n\n";
my $json_data = get_last_ten_colors($dbh);

# Output background color
#print "$json_data\n";

}




sub debug_output {
    my @output = @_;

    print "Content-Type: text/html\n\n";
    foreach (@output) {
        print($_);
        print('<br>');
    }
    exit;
}



sub print_json {
    my $json = shift;
    push @json_data, $json; # Store JSON data in the global array
}

sub print_to_json {
    my $output = to_json(\@json_data);
    print $cgi->header("application/json");
    print $output;
}

print_to_json();