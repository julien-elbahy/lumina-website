#!/usr/bin/perl
# update-dates.pl — Update dateModified in JSON-LD schemas, visible dates, and sitemap
# Usage: perl update-dates.pl              (updates all changed HTML files vs main)
#        perl update-dates.pl --all        (updates ALL HTML files)
#        perl update-dates.pl file1 file2  (updates specific files)
use strict;
use warnings;
use POSIX qw(strftime);

my $today = strftime('%Y-%m-%d', localtime);
my ($y, $m) = ($today =~ /^(\d{4})-(\d{2})/);

my %month_en = ('01'=>'January','02'=>'February','03'=>'March','04'=>'April','05'=>'May','06'=>'June',
                '07'=>'July','08'=>'August','09'=>'September','10'=>'October','11'=>'November','12'=>'December');
my %month_de = ('01'=>'Januar','02'=>'Februar','03'=>"M\xc3\xa4rz",'04'=>'April','05'=>'Mai','06'=>'Juni',
                '07'=>'Juli','08'=>'August','09'=>'September','10'=>'Oktober','11'=>'November','12'=>'Dezember');

my $en_label = "Last updated: $month_en{$m} $y";
my $de_label = "Zuletzt aktualisiert: $month_de{$m} $y";

# Determine which files to update
my @files;
if (@ARGV && $ARGV[0] eq '--all') {
    @files = glob('*.html de/*.html tools/*/index.html de/tools/*/index.html blog/*/index.html de/blog/*/index.html');
} elsif (@ARGV) {
    @files = @ARGV;
} else {
    # Git diff vs main — only changed HTML files
    my @diff = `git diff --name-only main -- "*.html"`;
    chomp @diff;
    @files = grep { -f $_ } @diff;
    if (!@files) {
        print "No changed HTML files found (vs main). Use --all or specify files.\n";
        exit 0;
    }
}

my $updated = 0;

for my $file (@files) {
    open my $fh, '<:raw', $file or do { warn "Cannot open $file: $!\n"; next };
    my $c = do { local $/; <$fh> };
    close $fh;

    my $changed = 0;

    # 1. Update dateModified in JSON-LD
    if ($c =~ s/"dateModified"\s*:\s*"[^"]*"/"dateModified":"$today"/g) {
        $changed = 1;
    }

    # 2. Update visible "Last updated" / "Zuletzt aktualisiert" text
    my $is_de = ($file =~ m|^de/|);
    my $label = $is_de ? $de_label : $en_label;
    if ($c =~ s/(class="tool-updated">)[^<]*(<)/$1$label$2/g) {
        $changed = 1;
    }

    # Write back if changed
    if ($changed) {
        open my $out, '>:raw', $file or do { warn "Cannot write $file: $!\n"; next };
        print $out $c;
        close $out;
        print "Updated: $file\n";
        $updated++;
    }
}

# 3. Update sitemap.xml lastmod for changed URLs
if (-f 'sitemap.xml') {
    open my $fh, '<:raw', 'sitemap.xml' or die "Cannot open sitemap.xml: $!\n";
    my $sm = do { local $/; <$fh> };
    close $fh;

    my $sm_changed = 0;
    for my $file (@files) {
        # Convert file path to URL path
        my $path = $file;
        $path =~ s|\\|/|g;
        $path =~ s|index\.html$||;
        $path =~ s|\.html$||;
        # Build the URL pattern to find in sitemap
        my $url_path = $path;
        $url_path = '/' . $url_path if $url_path !~ m|^/|;
        $url_path .= '/' if $url_path !~ m|/$|;
        $url_path = '' if $url_path eq '/./';

        # Find the <url> block containing this URL and update its <lastmod>
        my $loc_pattern = quotemeta("https://lumina-seo.com${url_path}");
        if ($sm =~ s|(<loc>${loc_pattern}</loc>.*?<lastmod>)\d{4}-\d{2}-\d{2}(</lastmod>)|${1}${today}${2}|s) {
            $sm_changed = 1;
        }
    }

    if ($sm_changed) {
        open my $out, '>:raw', 'sitemap.xml' or die "Cannot write sitemap.xml: $!\n";
        print $out $sm;
        close $out;
        print "Updated: sitemap.xml\n";
        $updated++;
    }
}

print "\nDone. $updated file(s) updated (dateModified: $today).\n";
