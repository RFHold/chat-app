  <h1> DiaLOG </h1>
  
  <h2> Project Summary </h2>
  
  DiaLOG allows users to create groups for coworkers, their friends, family, etc.  Each group can have separate channels within the group to discuss different topics. Each user will create a unique account on the app before using it which is authenticated on the back-end every time they perform an action on the site. We are hashing their passwords using BCrypt to keep their login secure.  We are utilizing Pug as an HTML templating engine to easily and dynamically generate our content on the page.  This allows for succinct, dry code.  We are also using web sockets to transmit data packets in real time so users can see each other’s posts immediately without refreshing. We have a mySQL database on the back-end which stores all user info and posts.
  
<h2> User Interface </h2>

  When a new user comes to the page, they are immediately directed to make a new account with a username and password. Then, if they are the first user after deploy, they are automatically directed to make a new group to start the conversation. Otherwise it just opens up the main app page, which displays all the current groups and channels. Finally channels can be created within a group by any user who is a member of the group. Any user can create and destroy groups/channels, as well as add members to a group they are already a member of or delete members from said group.  Users can make text posts to channels as well as delete posts on a channel as long as they are members of that channel's group. Users cannot see posts in groups they are not a member of, or make posts to those group's channels. Users/groups/channels/posts are data persistent and securely encrypted. Logins and sessions are persistent.
