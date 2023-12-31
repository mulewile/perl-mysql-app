#!C:/Strawberry/perl/bin/perl.exe

use strict;
use warnings;
use JSON;
use CGI;
use CGI::Carp qw(fatalsToBrowser);
use DBI;
use Crypt::SaltedHash;



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



if($action eq "create color data"){
    &insert_color_data($dbh);
} elsif($action eq "create user"){
    &generate_hashed_password();
}
    else{
    main_load();
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

    my $insert_query = "INSERT INTO backgroundcolor (COLOR_NAME, COLOR_MEANING, COLOR_MEMORIES) VALUES (?, ?, ?)";
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
            my $delete_query = "DELETE FROM backgroundcolor WHERE id = ?";
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
            (SELECT COUNT(main.COLOR_NAME) FROM backgroundcolor as main WHERE main.COLOR_NAME = tbls.COLOR_NAME) as color_count
        FROM backgroundcolor as tbls
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

    my %color_data = ("color_object" => \@last_ten_colors);
    my $json = encode_json \%color_data;

    return $json;
}


use strict;
use warnings;
use Crypt::SaltedHash;
use DBI;

sub generate_hashed_password {
    my $firstname = $request_body->{firstname_input};
    my $lastname = $request_body->{lastname_input};
    my $username = $request_body->{username_input};
    my $email = $request_body->{email_input};
    my $user_password = $request_body->{password_input};
    my $is_user_created_value = "1";



    # Check if the username already exists
    my $check_username_query = "SELECT COUNT(*) FROM tbl_user_data WHERE USER_NAME = ?";
    my $username_exists = $dbh->selectrow_array($check_username_query, undef, $username);

    if ($username_exists) {
        print_json({"error" => "Username already exists"});
        return;
    }

    # Create a salted hash of the password
    my $salted_object = Crypt::SaltedHash->new(algorithm => 'SHA-1');
    $salted_object->add($user_password);
    my $hashed_password = $salted_object->generate;

    # Insert user data into the database
    my $insert_query = "INSERT INTO tbl_user_data (FIRST_NAME, SURNAME, EMAIL, USER_NAME, PASSWORD) VALUES (?, ?, ?, ?, ?)";
    my $insert_sth = $dbh->prepare($insert_query);
    $insert_sth->execute($firstname, $lastname, $email, $username, $hashed_password);

    print_json({"success" => "User created successfully", "isUserCreated" => $is_user_created_value});


    $dbh->disconnect;  # Disconnect from the database
}




sub main_load{
    print "Content-Type: text/html\n\n";
my $json_data = get_last_ten_colors($dbh);

# Output background color
print "$json_data\n";

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

sub print_json{
    my $json = shift;

    my $output = to_json($json);

    print $cgi->header("application/json");
    print($output); 
}
