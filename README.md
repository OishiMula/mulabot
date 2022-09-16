# Mula bot
A general all-purpose bot to improve entertainment and provide useful utilities for any general Cardano NFT discord server. <br>
There are many functions to this bot, some are useful, and some are silly. Overall, the bot can provide stats for CNFT projects such as:<br>
<ul>
<li>Current floor price</li>
<li><b>X</b> amount of last sales</li>
<li>All time high purchases</li>
<li>Trending projects</li>
<li>... and more!</li>
</ul>

At the moment, the bot is not launched on any Discord bot hosting platforms, this is still in an alpha-phase where I have a group of beta testers trying to break the bot and discover new features for it.<br> 
shout-out to degens den!<br>
If you do want it on your server, or have questions, reach out to me on my Twitter or Discord: <b>Oishi Mula#0001</b>
<br>

## Technical sauce
Congrats on getting this far, here's a quick rundown on what to expect from the code:<br>
<ul>
<li><b>index.js</b></li> -> This is the main runner, the starting bot for the bot
<li><b>mula_functions.js</b> -> General functions that are used more than once are placed here for other commands/events. Also includes shortcuts for projects, random misc.</li>
<li><b>commands | events</b> -> Where most of the code is, where each slash command / event code lives. Inside each folder is each command or event saved individually, and clearly.</li>
</ul>