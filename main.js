var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var path = require('path');
var sanitizeHtml = require('sanitize-html');
var template = require('./lib/template.js');

var app = http.createServer(function(request,response){
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname;

    if(pathname === '/') {
        if(queryData.id === undefined) {
            fs.readdir('./data', function(error, filelist) {
                var list = template.list(filelist, queryData.id);
                title = 'JSChang';
                var description = 'Welcome to JSChang homepage';
                var html = template.HTML(title, list, `
                <h3>${title}</h3>
                <ul>
                    ${description}
                </ul>
                `, `
                <a href="/create">Create</a>
                `);
                response.writeHead(200);
                response.end(html);
            });
        } else {
            fs.readdir('./data', function(error, filelist) {
                var title = queryData.id;
                var sanitizedTitle = sanitizeHtml(title);
                var list = template.list(filelist, sanitizedTitle);
                var filteredId = path.parse(queryData.id).base;
                fs.readFile(`data/${filteredId}`, 'utf8', function(err, description) {
                    var sanitizedDescription = sanitizeHtml(description);
                    var html = template.HTML(sanitizedTitle, list, `
                    <h3>${sanitizedTitle}</h3>
                    <ul>
                        ${sanitizedDescription}
                    </ul>
                    `, `
                    <a href="/update?id=${sanitizedTitle}">Update</a>
                    <form action="/delete_process" method="post" onclick="alert('Do you really want to delete?')">
                    <input type="hidden" name="id" value="${sanitizedTitle}">
                    <input type="submit" value="Delete">
                    </form>
                    `);
                    response.writeHead(200);
                    response.end(html);
                });
            });
        }
    } else if(pathname === '/create') {
        fs.readdir('./data', function(error, filelist) {
            var list = template.list(filelist, title);
            var title = 'Create';
            var html = template.HTML(title, list, `
            <h3>${title}</h3>
            <ul>
                <form action="/create_process" method="post">
                    <p><input type="text" name="title" placeholder="title"></p>
                    <p><textarea name="description" placeholder="description"></textarea></p>
                    <p><input type="submit"></p>
                </form>
            </ul>
            `, ` `);
            response.writeHead(200);
            response.end(html);
        });
    } else if(pathname === '/create_process') {
        var body = '';
        request.on('data', function(data) {
            body += data;
            // Security
            if(body.length>1e8) {
                request.connection.destroy();
            }
        });
        request.on('end', function() {
            var post = qs.parse(body);
            var title = post.title;
            var sanitizedTitle = sanitizeHtml(title);
            var description = post.description;
            var sanitizedDescription = sanitizeHtml(description);
            fs.writeFile(`data/${sanitizedTitle}`, sanitizedDescription, 'utf8', function(err) {
                response.writeHead(302, {Location: `/?id=${sanitizedTitle}`});
                response.end('Succcss');
            });
        });
    } else if(pathname === '/update') {
        fs.readdir('./data', function(error, filelist) {
            var filteredId = path.parse(queryData.id).base;
            fs.readFile(`data/${filteredId}`, 'utf8', function(err, description) {
                var list = template.list(filelist, title);
                var title = queryData.id;
                console.log(description);
                var html = template.HTML(title, list, `
                <h3>${title} - update</h3>
                <ul>
                    <form action="/update_process" method="post">
                        <p><input type="hidden" name="id" value="${title}"></p>
                        <p><input type="text" name="title" placeholder="title" value="${title}"></p>
                        <p><textarea name="description" placeholder="description">${description}</textarea></p>
                        <p><input type="submit"></p>
                    </form>
                </ul>
                `, ` `);
                response.writeHead(200);
                response.end(html);
            });
        });
    } else if(pathname === '/update_process') {
        var body = '';
        request.on('data', function(data) {
            body += data;
        });
        request.on('end', function() {
            var post = qs.parse(body);
            var id = post.id;
            var title = post.title;
            var sanitizedTitle = sanitizeHtml(title);
            var description = post.description;
            var sanitizedDescription = sanitizeHtml(description);
            var filteredId = path.parse(id).base;
            fs.rename(`data/${filteredId}`, `data/${sanitizedTitle}`, function(err) {
                fs.writeFile(`data/${sanitizedTitle}`, sanitizedDescription, 'utf8', function(err) {
                    response.writeHead(302, {Location: `/?id=${sanitizedTitle}`});
                    response.end('Succcss');
                });
            })
        });
    } else if(pathname === '/delete_process') {
        var body = '';
        request.on('data', function(data) {
            body += data;
        });
        request.on('end', function() {
            var post = qs.parse(body);
            var id = post.id;
            var filteredId = path.parse(id).base;
            fs.unlink(`data/${filteredId}`, function(err) {
                response.writeHead(302, {Location: `/`});
                response.end('Succcss');
            });
        });
    } else {
        console.log(_url);
        response.writeHead(404);
        response.end('Page Not Found');
    }
});
app.listen(3000);