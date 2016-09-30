# Cricket Stats

This cricket-stats component is responsible for answering stats based cricket questions.  It needs to be used with these other components.
* https://github.com/ce-store/ce-store.git
* https://github.com/shawdm/cricket-nodered
* https://github.com/shawdm/cricket-ui.git


## Development Setup
Require cricsheet stats data.  Download data from http://cricsheet.org/downloads/all.zip and extract contents into ````cricsheet```` directory.

Requires [Vagrant](https://www.vagrantup.com).

    vagrant up
    vagrant ssh
    cd /vagrant
    npm install


## Starting Up
    npm start


## Example Questions
* ~Who has the most balls faced?~
* ~Who has the least balls faced?~
* ~Who has the most runs?~
* ~Who has the least runs?~
* ~Who has the highest batting average?~
* ~Who has the lowest batting average?~
* ~Who has the least total outs?~
* ~Who has the most total outs?~

* ~What is JE Roots batting average?~
* ~How many career matches has JE Root played?~

* ~How many balls faced has JE Root had?~

* ~How many runs has JE Root scored against Australia?~
* ~What is JE root batting average against Australia?~
* ~What is JE Roots matches played against India?~

* ~What is JE Roots balls faced against India?~
* ~How many runs has JE Root scored?~

* ~What Indian has the highest batting average?~
* ~What Englishman has the highest batting average?~

* ~What is Sachin Tendulkar's batting average?~

* ~What is Andrew Strauss's batting average?~
* ~What Aussie has the highest batting average?~

* Who has the highest batting average against New Zealand
* How many matches has Sachin Tendulkar played?

* What Aussie has the highest batting average in an ODI?
* What Aussie has the highest batting average in an ODI first innings?
