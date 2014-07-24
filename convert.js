var Mustache = require('mustache');
var fs = require('fs');
var xml2js = require('xml2js');

/*
 */

//var parser = new xml2js.Parser();
//parser.addListener('end', doneParsing );

var commandTemplate='';
var navTemplate='';
var afterNavHTML='';
var footerHTML='';
var headerHTML='';

var loadCount=0;
var adminCommands=[];
var publicCommands=[];

fs.readFile(__dirname + '/nav.template', { encoding: 'utf-8' }, function(err, data) {
    navTemplate=data;
    fs.readFile(__dirname + '/command.template', { encoding: 'utf-8' }, function(err, data) {
        commandTemplate=data;

        commandTemplate

        fs.readFile(__dirname + '/html/afternav.html', { encoding: 'utf-8' }, function(err, data) {
            afterNavHTML=data;

            fs.readFile(__dirname + '/html/footer.html', { encoding: 'utf-8' }, function(err, data) {
                footerHTML=data;

                fs.readFile(__dirname + '/html/header.html', { encoding: 'utf-8' }, function(err, data) {
                    headerHTML=data;

                    loadCommandXML();
                });
            });
        });
    });
});


function loadCommandXML() {
    var files = fs.readdirSync(__dirname + '/commands');

    loadCount=files.length;
    for (var i in files) {

        fs.readFile(__dirname +'/commands/'+ files[i], function (err, data) {
            xml2js.parseString(data, doneParsing );
            loadCount--;
            if(loadCount==0) writeHTML();
        });
    }
}


function byName(a, b){
    if(a.name < b.name) return -1;
    if(a.name > b.name) return 1;
    return 0;
};

function type_link()
{
    if(this.type[0]==='amount') return( '<a href="#amount">'+this.type[0]+'</a>');
    return('<strong>'+this.type[0]+'</strong>');
}


function attachSubnav(commandArray, command)
{
    for(var i=0; i<commandArray.length; i++)
    {
        if(commandArray[i].name[0]===command.subnav[0])
        {
            if(! commandArray[i].sublist) commandArray[i].sublist=[];
            commandArray[i].sublist.push({'name': command.name[0], 'linkname' : command.name[0].replace(/\s+/g, '-').toLowerCase()}  );
        }
    }
}

function doneParsing(err,result)
{
    if(err)
    {
        console.log(err);
        return;
    }
    //console.log(result);
    var commandArray=result.commands.command;
    for(var i=0; i<commandArray.length; i++)
    {
        commandArray[i].link=function(){
            return( this.name[0].replace(/\s+/g, '-').toLowerCase() );
        };

        commandArray[i].type_link=function(){
            if(this.type[0]==='amount') return( '<a href="#amount">'+this.type[0]+'</a>');
            return('<strong>'+this.type[0]+'</strong>');
        };

        if(commandArray[i].subnav)
        {
            attachSubnav(commandArray,commandArray[i]);
            var nHTML='';
        }else var nHTML = Mustache.render(navTemplate, commandArray[i]);
        var cHTML = Mustache.render(commandTemplate, commandArray[i]);

        var obj={'name': commandArray[i].name[0],'html':cHTML,'nav': nHTML};
        if(commandArray[i].admin[0]==='true') adminCommands.push( obj );
        else publicCommands.push(obj);
    }

}


function writeHTML()
{
    var navHTML='';
    var commandsHTML='';

    adminCommands.sort(byName);
    publicCommands.sort(byName);

    for(var i=0; i<publicCommands.length; i++)
    {
        //if(publicCommands[i].name[0]==='submit') navHTML += '<ul>'
        navHTML += publicCommands[i].nav;
        commandsHTML += publicCommands[i].html;
    }

    navHTML += '</ul>       </section><section>    <h3>Admin commands</h3>    <ul>';

    for(var i=0; i<adminCommands.length; i++)
    {
        navHTML += adminCommands[i].nav;
        commandsHTML += adminCommands[i].html;
    }

    var allHTML=headerHTML + navHTML + afterNavHTML + commandsHTML + footerHTML;

    fs.writeFile(__dirname + '/api-docs.html',allHTML);
}