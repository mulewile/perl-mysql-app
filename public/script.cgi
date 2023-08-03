#!C:/Strawberry/perl/bin/perl.exe

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

# MySQL database configuration
my $dsn      = "DBI:mysql:mydb";
my $username = "root";
my $password = "root100";

# withou RasieError off:
 my $dbh  = DBI->connect($dsn,$username,$password) or 
            die("Error connecting to the database: $DBI::errstr\n");

#print "Connected to the myDB database.";

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


# Retrieve color data from MySQL database
my $select_query = "SELECT 
                        color, 
                        color_meaning, 
                        color_memories,
(SELECT COUNT(main.color) FROM backgroundcolor as main where main.color = tbls.color) as color_count
FROM backgroundcolor as tbls ORDER BY id DESC LIMIT 10";
my $select_stmt = $dbh->prepare($select_query);
$select_stmt->execute();

my ($color_name, $color_meaning, $color_memories, $color_count);
my @last_ten_colors;

while(my @daten = $select_stmt->fetchrow_array()){
    $color_name     = $daten[0];
    $color_meaning  = $daten[1];
    $color_memories = $daten[2];
    $color_count    = $daten[3];

    # Hash.
    # Hash -> key -> value
    push(@last_ten_colors, {"color_name" => $daten[0], "color_meaning" => $daten[1], "color_memories" => $daten[2],  "color_count" => $daten[3]});
}

# Get color frequency.

my %color_data = ("color_object" => \@last_ten_colors);
my $json = encode_json \%color_data;


# Close the database connection
$dbh->disconnect();

# Output background color
print "$json\n";
