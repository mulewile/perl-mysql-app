#!C:/Strawberry/perl/bin/perl.exe

use strict;
use warnings;
use CGI;
use DBI;

print "Content-Type: text/html\n\n";
# print "Perl MySQL Connect demo\n";

# Create CGI object
my $cgi = CGI->new();

# MySQL database configuration
my $dsn      = "DBI:mysql:";
my $username = "";
my $password = '';

# withou RasieError off:
 my $dbh  = DBI->connect($dsn,$username,$password) or 
            die("Error connecting to the database: $DBI::errstr\n");

# print "Connected to the myDB database.";

# Get form data
my $color_name = $cgi->param('color');

if ($color_name) {
    # Insert form data into the MySQL database
    my $insert_query = "INSERT INTO backgroundcolor (color) VALUES (?)";
    my $insert_stmt = $dbh->prepare($insert_query);
    $insert_stmt->execute($color_name);
    
    # Output success message
    print "Form data stored successfully.";
}

# Retrieve background color from MySQL database
my $select_query = "SELECT color FROM backgroundcolor ORDER BY id DESC LIMIT 1";
my $select_stmt = $dbh->prepare($select_query);
$select_stmt->execute();

my ($background_color) = $select_stmt->fetchrow_array();



# Close the database connection
$dbh->disconnect();

# Output background color
print $background_color;
