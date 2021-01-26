var http = require('http');
var fs = require('fs');
var url = require('url');

function templateHTML(title, list, body) {
    return `
    <!DOCTYPE html>
    <html>
        <head>
            <title>JSChang - ${title}</title>
            <meta charset="utf-8">
            <style>
            body {
                background-color: white;
                color: black;
            }
            h1 {
                font-size: 40px;
                text-align: center;
                border-bottom: 1px solid light;
                margin: 0px;
                padding: 10px;
            }
            .saw {
                color:gray;
            }
            .cur {
                text-decoration: underline;
            }
            #grid ol {
                border-right: 1px solid gray;
                width: 100px;
                margin: 0px;
                padding: 10px;
                padding-left: 30px;
            }
            #grid {
                display: grid;
                grid-template-columns: 150px 1fr;
            }
            #article {
                padding: 10px;
                padding-left: 30px;
            }
            #grid h3 {
                margin: 0px;
                margin-bottom: 10px;
            }
            #grid ul {
                margin: 0px;
                padding-left: 30px;
            }
            a {
                color:black;
                text-decoration: none;
            }
            @media(max-width: 800px) {
                #grid {
                    display: block;
                }
                #grid ol {
                    border-right: none;
                }
                h1 {
                    border-bottom: none;
                }
            }
            </style>
            <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
            <script>
            var Body = {
                setBodyColor: function setBodyColor(color) {
                    document.querySelector('body').style.color = color;
                },
                setBodyBackgroundColor: function setBodyColor(color) {
                    document.querySelector('body').style.backgroundColor = color;
                }
            };
            
            var Link = {
                setLinkColor: function setLinkColor(color) {
                    // var links = document.querySelectorAll('a');
                    // for(var i=0; i<links.length; i++) {
                    //     links[i].style.color = color;
                    // }
                    $('a').css("color", color);
                }
            };
            
            function nightDayHandler(self) {
                if(self.value==='Night') {
                    Body.setBodyBackgroundColor('black');
                    Body.setBodyColor('white');
                    Link.setLinkColor('white');
                    document.getElementById('night_day').value = 'Day';
                } else {
                    Body.setBodyBackgroundColor('white');
                    Body.setBodyColor('black');
                    Link.setLinkColor('black')
                    document.getElementById('night_day').value = 'Night';
                }
            }
            </script>
        </head>
        <body>
            <h1><a href="/">JSChang</a></h1>
            <input type="button" id="night_day" value="Night" onclick="nightDayHandler(this)">
            <div id="grid">
                ${list}
                <div id="article">
                ${body}
                </div>
            </div>
        </body>
    </html>
    `
}

function templatList(filelist, title) {
    var list = '<ol>'
    for(var i=0; i<filelist.length; i++) {
        if(filelist[i] === title) {
            list += `<li><a href="/?id=${filelist[i]}" class="cur">${filelist[i]}</a></li>`;
        } else {
            list += `<li><a href="/?id=${filelist[i]}" class="saw">${filelist[i]}</a></li>`;
        }
    }
    list +='</ol>'
    return list;
}

var app = http.createServer(function(request,response){
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var title = queryData.id;
    var pathname = url.parse(_url, true).pathname;

    if(pathname === '/') {
        if(queryData.id === undefined) {
            fs.readdir('./data', function(error, filelist) {
                var list = templatList(filelist, title);

                title = 'JSChang';
                var description = 'Hello World.';
                var template = templateHTML(title, list, `
                <h3>${title}</h3>
                <ul>
                    ${description}
                </ul>
                `);
                response.writeHead(200);
                response.end(template);
            });
        } else {
            fs.readdir('./data', function(error, filelist) {
                var list = templatList(filelist, title);

                fs.readFile(`data/${queryData.id}`, 'utf8', function(err, description) {
                    var template = templateHTML(title, list, `
                    <h3>${title}</h3>
                    <ul>
                        ${description}
                    </ul>
                    `);
                    response.writeHead(200);
                    response.end(template);
                });
            });
        }
    } else {
        response.writeHead(404);
        response.end('Page Not Found');
    }
});
app.listen(3000);