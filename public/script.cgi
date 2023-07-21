#!C:/Strawberry/perl/bin/perl.exe

use strict;
use warnings;
use JSON;
use CGI;
use DBI;

print "Content-Type: text/html\n\n";
# print "Perl MySQL Connect demo\n";

# Create CGI object
my $cgi = CGI->new();

# MySQL database configuration
my $dsn      = "DBI:mysql:mydb";
my $username = "root";
my $password = 'root100';

# withou RasieError off:
 my $dbh  = DBI->connect($dsn,$username,$password) or 
            die("Error connecting to the database: $DBI::errstr\n");

# print "Connected to the myDB database.";

# Get form data
my $color_name = $cgi->param('color');
my $color_meaning = $cgi->param('colorMeaning');
if ($color_name && $color_meaning) {
    # Insert form data into the MySQL database
    my $insert_query = "INSERT INTO backgroundcolor (color, colormeaning) VALUES (?, ?)";
    my $insert_stmt = $dbh->prepare($insert_query);
    $insert_stmt->execute($color_name, $color_meaning);
    
    # Output success message
    print "Form data stored successfully.";
}



# Retrieve background color from MySQL database
my $select_query = "SELECT color, colormeaning FROM backgroundcolor ORDER BY id DESC LIMIT 1";
my $select_stmt = $dbh->prepare($select_query);
$select_stmt->execute();

my ($color_name, $color_meaning) = $select_stmt->fetchrow_array();


my %color_data = ('name' => "$color_name", 'meaning' => "$color_meaning");
my $json = encode_json \%color_data;


# Close the database connection
$dbh->disconnect();

# Output background color
print "$json\n";
