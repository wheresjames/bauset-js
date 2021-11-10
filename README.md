
# bauset

npm package builder.

npm is wonderful, and fully capable on it's own of building packages.
If it works for you I suggest using npm directly.  The goal of this
module is to go a bit further at consolidating the package information
and to support both online and offline deployment.

To get started, you can simply make a copy of this project and modify it.

* All project settings are in the file named <b>PROJECT.txt</b>.

* Package files can optionally be specified in <b>MANIFEST.txt</b>.

    The default manifest is <b>['PROJECT.txt', 'README.md', 'LICENSE', 'lib', 'bin', 'test', 'doc']</b>.

    It's ok if files in the manifest are missing.

* Scripts to be executed from the command line should be in <b>[bin]</b>

* Library files should be placed in <b>[lib]</b>

* Unit / Regression tests should be in <b>[test]</b>
    Specifically, <b>./test/test.js</b> will be run if the <b>-t/--test</b> option is specified.

* Documentation should be in <b>[doc]</b>

* <b>README.md</b> (this file), will be used to make the landing page for npmjs.com

* Built packages will be in <b>[pkg]</b>, staging will be done in <b>[dist]</b>


### As command line tool

``` bash

    # From the project root directory
    bauset --global --install --test

    # Using short form
    bauset -git

```

### As library

``` javascript

    const bauset = require('bauset');

    // Create install package
    bauset.createPackage('/path/to/project/root', '/destination/path' {install:false, global:false});

```

---------------------------------------------------------------------
## Table of contents

* [Install](#install)
* [How to use](#how-to)
* [References](#references)

&nbsp;

---------------------------------------------------------------------
## Install

    $ npm install bauset

&nbsp;


---------------------------------------------------------------------
## How To

Bauset will only run in a unix like environment.

Bauset expects the input directory to look like the following

```
    [project root]
    |
    +---> PROJECT.txt      - File containing project information in the
    |                        format of...
    |                           name            <project name>
    |                           version         <project version>
    |                           description     <project description>
    |                           company         <company name>
    |                           author          <Author name>
    |                           email           <Project email>
    |                           url             <Project home URL>
    |                           repo            <Project repository>
    |                           bugs            <Bug reports>
    |                           license         <Project license type>
    |
    +---> MANIFEST.txt      - Optional file containing the list of files and
    |                         directories that should be included in the package.
    |                         The default manifest is...
    |                           ['PROJECT.txt', 'README.md', 'LICENSE', 'lib', 'bin', 'test', 'doc']
    |
    |                         Files not in the manifest are ignored for the project build.
    |
    +---> README.md         - This file.  Project description and information.  This will
    |                         be used as the front page for npmjs.com when published.
    |
    +---> LICENSE           - Project License information
    |
    +---- [bin]             - Scripts to be executed from the command line
    |
    +---- [lib]             - Library scripts
    |
    +---- [test]            - Test scripts
    |     |
    |     +---> test.js     - Main test script, this script is run if -t/--test is specified
    |     +---> demo.js     - Main demo script
    |
    +---- [doc]             - Documentation files
    |
    +---- [var]             - Configuration files
          |
          +---> in.package.json     - package.json template file

```

The following will be output by bauset.

```
    [project root]
    |
    +---- [dist]    - Staging area for build files
    |
    +---- [pkg]     - Final packages in the format of <name>-<version>.tgz
                      A package in the form of <name>-latest.tgz

```

Optionally the built package can be installed using the -i/--install option.
Use -g/--global to install the package globally.


Example

``` bash

    # From project root directory
    bauset --install --global

    # The project root directory can also be specified with the --source option
    bauset --install --global --source /path/to/project/root

```


If you're using bauset to build itself, and it is not installed.
It can be run inplace using the __\_\_bootstrap\_\___ option.  This is
only for using bauset to build itself.

``` bash

    # From bauset project directory
    ./bin/bauset __boostrap__ --install --global

```

[To publish your project to npmjs.com](https://docs.npmjs.com/cli/v6/commands/npm-publish),
use something like the following.

``` bash

    # Publish
    npm publish ./pkg/<name>-latest.tgz

```

&nbsp;


---------------------------------------------------------------------
## References

- Node.js
    - https://nodejs.org/

- npm
    - https://www.npmjs.com/
