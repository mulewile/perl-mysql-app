#!C:/Strawberry/perl/bin/perl.exe

# Your database code here, using $dsn, $username, and $password

use strict;
use warnings;
use JSON;
use CGI;
use CGI::Carp qw(fatalsToBrowser);
use DBI;

print "Content-Type: text/html\n\n";
# print "Perl MySQL Connect demo\n";

# Create CGI object
my $cgi = CGI->new();

my $json_environmental_variables = "../.env.json";

# Read the JSON file
open my $json_file_handler, '<', $json_environmental_variables  or die "Failed to open $json_environmental_variables : $!";
my $json_data;
{
    local $/;
    $json_data = <$json_file_handler>;
}
close $json_file_handler;

# Parse the JSON data
my $config = decode_json($json_data);

# Access the stored values
my $dsn = $config->{dsn};
my $username = $config->{username};
my $password = $config->{password};

# Connect to the database
my $dbh = DBI->connect($dsn, $username, $password) or die("Error connecting to the database: $DBI::errstr\n");


# Get form data
my $color_name = $cgi->param('color');
my $color_meaning = $cgi->param('colorMeaning');
my $color_memories = $cgi->param('colorMemories');

if ($color_name && $color_meaning) {
    # Insert form data into the MySQL database
    my $insert_query = "INSERT INTO backgroundcolor (color, color_meaning, color_memories) VALUES (?, ?, ?)";
    my $insert_stmt = $dbh->prepare($insert_query);
    $insert_stmt->execute($color_name, $color_meaning, $color_memories) or die "Unable to execute sql: $insert_stmt->errstr";
    
    # Output success message
    print "Form data stored successfully.";
}

# Handle DELETE request
if ($cgi->request_method() eq 'DELETE') {
    my $color_id = $cgi->param('id');

    if ($color_id) {
        my $delete_query = "DELETE FROM backgroundcolor WHERE id = ?";
        my $delete_stmt = $dbh->prepare($delete_query);
        $delete_stmt->execute($color_id) or die "Unable to execute SQL: $delete_stmt->errstr";
        print "Record deleted successfully.";
    }
} 


# Retrieve color data from MySQL database
my $select_query = "SELECT 
                        id,
                        color, 
                        color_meaning, 
                        color_memories,
(SELECT COUNT(main.color) FROM backgroundcolor as main where main.color = tbls.color) as color_count
FROM backgroundcolor as tbls ORDER BY id DESC LIMIT 10";
my $select_stmt = $dbh->prepare($select_query);
$select_stmt->execute();

my ($color_id, $color_name, $color_meaning, $color_memories, $color_count);
my @last_ten_colors;

while(my @daten = $select_stmt->fetchrow_array()){
    push(@last_ten_colors, {"color_id" => $daten[0], "color_name" => $daten[1], "color_meaning" => $daten[2], "color_memories" => $daten[3],  "color_count" => $daten[4]});
}

# Get color frequency.

my %color_data = ("color_object" => \@last_ten_colors);
my $json = encode_json \%color_data;

# Close the database connection
$dbh->disconnect();

# Output background color
print "$json\n";
