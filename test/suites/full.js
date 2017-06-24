const assert = require('chai').assert;
const cheerio = require('cheerio');
const htt = require("../../index.js");

const document = `
<html>
  <body>
    <h1>My mail</h1>
    
    <div><table><tr><th><h2>Introduction</h2></th></tr><tr>
      <td>
         Lorem <a href="http://www.google.com">ipsum dolor</a> sit amet, consectetur adipiscing elit. Maecenas odio 
         quam, accumsan sed accumsan at, ultricies ut enim. Nam aliquam semper
         dolor <a>quis</a> rutrum. Curabitur ut tincidunt arcu. Vivamus porta mattis
         commodo. Proin venenatis a ex at dictum. In erat odio, sagittis vitae
         aliquam ac, semper nec turpis. Suspendisse sed volutpat nisi, ut cursus
         diam. Maecenas cursus urna ac mollis pharetra. Morbi aliquam tempus metus,
         nec euismod dolor maximus eu. Nullam at libero at velit elementum mollis
         iaculis eget nibh. Sed auctor mattis hendrerit. Cras consequat eu urna egestas
         maximus. Cras tincidunt dignissim mi. Fusce vel vulputate ante,
         et lobortis magna. Morbi ut tincidunt tellus, quis condimentum magna.
         <blockquote>
         Vivamus condimentum euismod gravida. Mauris tempor felis mollis 
         tortor interdum, in viverra massa finibus. Praesent gravida malesuada
         sapien, a efficitur ante ultricies ornare.
         </blockquote>
         <p>
         Integer <a href="http://www.google.com">http://www.google.com</a> enim, aliquet et maximus id, dignissim quis augue. 
         Mauris elementum semper eros, eu ullamcorper leo porttitor et. Sed 
         nulla libero, gravida non lectus id, tempor efficitur elit. Proin
         mollis ipsum non metus elementum, sed porta felis pretium. Mauris 
         non nulla quis sem dapibus pretium ullamcorper nec risus. Nunc sed 
         massa eget ante tincidunt tempor. Nam euismod massa at nibh mattis,
         in efficitur purus tempor. Nulla in tellus at nisi dapibus interdum 
         at gravida mi. Nam ornare imperdiet malesuada. Nunc et tincidunt
         quam, faucibus sollicitudin turpis.
         </p>    
         Vivamus condimentum euismod gravida. Mauris tempor felis mollis 
         tortor interdum, in viverra massa finibus. Praesent gravida malesuada
         sapien, a efficitur ante ultricies ornare.
         <ul>
          <li>Vivamus condimentum euismod gravida. Mauris tempor felis mollis 
          tortor interdum, in viverra massa finibus. Praesent gravida malesuada
          sapien, a efficitur ante ultricies ornare.</li>
          <li>Vivamus condimentum euismod gravida. Mauris tempor felis mollis 
          tortor interdum, in viverra massa finibus.</li>
          <li>Vivamus condimentum euismod gravida.</li>
         </ul>
      </td>
    </tr></table></div>
  </body>
</html>
`;

describe("integration test", function() {
  it('should convert the html fragment', function() {
    console.log(htt.convert(document));
  });
});
