var Mustache = require('mustache');
var fs = require('fs');
var xml2js = require('xml2js');

/*
 */

var parser = new xml2js.Parser();
parser.addListener('end', doneParsing );

var commandTemplate='';
var navTemplate='';

fs.readFile(__dirname + '/nav.template', { encoding: 'utf-8' }, function(err, data) {
    navTemplate=data;
    fs.readFile(__dirname + '/command.template', { encoding: 'utf-8' }, function(err, data) {
        commandTemplate=data;
        fs.readFile(__dirname + '/api.xml', function(err, data) {
            parser.parseString(data);
        });
    });
});


function byName(a, b){
    if(a.name < b.name) return -1;
    if(a.name > b.name) return 1;
    return 0;
};

function doneParsing(result)
{
    var adminCommands=[];
    var publicCommands=[];

    var navHTML='';
    var commandsHTML='';
    console.log(result);
    var commandArray=result.api_docs.commands[0].command;
    for(var i=0; i<commandArray.length; i++)
    {
        var cHTML = Mustache.render(commandTemplate, commandArray[i]);
        var nHTML = Mustache.render(navTemplate, commandArray[i]);
        var obj={'name': commandArray[i].name[0],'html':cHTML,'nav': nHTML};
        if(commandArray[i].admin[0]==true) adminCommands.push( obj );
        else publicCommands.push(obj);
    }

    adminCommands.sort(byName);
    publicCommands.sort(byName);

    for(var i=0; i<publicCommands.length; i++)
    {
        navHTML += publicCommands[i].nav;
        commandsHTML += publicCommands[i].html;
    }

    for(var i=0; i<adminCommands.length; i++)
    {
        navHTML += adminCommands[i].nav;
        commandsHTML += adminCommands[i].html;
    }

    var allHTML=navHTML + commandsHTML;

    fs.writeFile(__dirname + '/out.html',allHTML);
}
