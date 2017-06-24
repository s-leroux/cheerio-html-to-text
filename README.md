# cheerio-html-to-text

A simple HTML to text converter.
Mostly useful when sending HTML email. Based on Cheerio
to avoid multiple parsing when couple with Juice.

[![Build Status](https://travis-ci.org/s-leroux/cheerio-html-to-text.png?branch=master)](https://travis-ci.org/s-leroux/cheerio-html-to-text)

## Installation

    npm install cheerio-html-to-text

## Usage

    const htt = require('html-to-text')
    const text = htt.convert(html);
    
Where `html` is either:

* a string containing your html document
* _or_ a cheerio parsed html document

## Node version
Tested with v6.6.0
 
## License 

(The MIT License)

Copyright (c) 2011 [Sylvain Leroux](sylvain@chicoree.fr)

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
