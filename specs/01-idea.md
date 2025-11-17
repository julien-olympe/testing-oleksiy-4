You are going to create an app that will use visual elements to set up a programming language logic.
The app will consist of:
- Login screen
- Home screen
- Project Editor
- Function editor

Login screen
Login screen will just allow logging in or register.

Home screen
Home screen will show projects created by the logged in user only. The other logged in users should not be able to see the other users' projects.
In the Home screen the user can deleted, rename or create projects.
The UI of the Home screen:
Top right: a round icon for main settings (showing on click: log out option and the user name)
On the left: Search bar and a list of found "bricks". So far the only displayed and findable brick should be "Project". If the user drags the "Project" brick to the left, a new project will be created on drop.
The center and the left side of the screen should list the existing projects belonging to the logged in user.

Project Editor:
When the user double clicked a project, the project editor for the project is shown
The UI of the editor:
Top-right : Same round icon as in the Home screen
Header: should show tabs: Project, Permissions, Database. The user can click on the tabs and the respective tabs should open in the central and left parts of the Project Editor.
On the left: Search bar and a list of found "bricks". So far the only displayed and findable brick should be "Function". If the user drags the "Function" brick to the left, a new Function will be created on drop. 
On double click on this or any added Functions, the respective Function Editor is opened.
In the Project screen the user can deleted, rename or create Functions.

If the user clicks the Permission tab, the central and left side of the Project editor should show the list of the users that have rights to see the project. The add a user button is shown and can be clicked to add a user by email. Only registered users can be added. Keep track of the registered users

If the user clicks the Database tab, the list of databases is shown. So far the user should be seeing the "default database" with a string property. The default database is a name for a data type. Inside the Database editor the user should be able to create instances of the data base (data type) and fill in the string prop value. The UI for the Data base tab: on the left: the list of the databases. On the right, the list of the DB instances. There is a button "Create instance" that allows creation of a new instance. As soon as the user clicks the Create instance button, an instance is added as a item in the instances listwith the input for the string property of the data type. Once the user inputs anything in the input, the string prop is automatically saved, so no need to click any save buttons.
When the user clicks the Permission and Database tabs, the add a project functionality is hidden and is shown again if the user clicks the Project tab

The Function editor
If the user double clicks a Function in the Project editor, the Function editor is opened.
UI for the Function editor: 
Use any library that fits best to build:
Top-right: Same round icon used in all the editors 
On the left: Search bar and a list of found "bricks". So far the only displayed and findable bricks should be "List instances  by DB name", "Get first instance" and "Log instance props". If the user drags a "bricks" to the left, the brick is added on the central panel. The panel should have a grid, so the added bricks will always take place on a particular grid cell.
There is a button "RUN" above the search bar.
The bricks in the Function editor should have inputs and outputs:
"List instances  by DB" name": inputs names: "Name of DB"; outputs: names "List". This brick has logic under the hood to get all the instances of the DB by its name. The user can click on the input and the list of available DBs is shows (in our case only the "default database" is listed here).
"Get first instance" : inputs names: "List", outputs: names: "DB". This brick gets the first instance of the DB (if any) and returns it as an object on the output.
"Log instance props":  inputs names "Object",  outputs: names: "value". This brick received a single object and outputs the object's props in the console.
The objects can be bound together by linking lines between them. Meaning the user can drag a line from, e.g. output of "List instances  by DB"'s output to "Get first instance"'s input.
Make brick inputs and outputs bigger dots so the user can easily distinguish them.
When the user assembles the logic (i.e. adds one "List instances  by DB", "Get first instance", "Log instance props" bricks and links the respective inputs/outputs) and clicks the RUN button, the app is supposed to perform the actions described by the bricks, i.e. Find the default database instances, get the first one and log its values and log the object in the console. If the user did not link the bricks properly or did not set the name of the DB on the "List instances  by DB" bricks, the logging should not take place. 
As soon as the user makes anything inside the Function editor, the changes are persisted, no need in any save buttons.

So happy path is:
user registers, logs in, creates a project, renames the project, enter the project, adds another registered user, creates db instances (and input the string values), adds a Function, enters the function, adds the "List instances  by DB", "Get first instance", 
"Log instance props" bricks, sets the "default database" on the "List instances  by DB" input, links the three bricks clicks run and sees the content of the first instance of the "default database".
