document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  // sending the emails
  document.querySelector('#compose-form').onsubmit = sendEmail

  // By default, load the inbox
  load_mailbox('inbox');
});

function open_email(email) {
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#individual-view').style.display = 'block';

    // Change to read
    if (!email.read) {
        void fetch(`/emails/${email.id}`, {
            method: 'PUT',
            body: JSON.stringify({
                read: true
            })
        });
    }

    //The HTML of the page
    document.querySelector('#individual-view').innerHTML = `
    <div class="vertical-space"><b>From: </b> ${email.sender}</div>
    <div class="vertical-space"><b>To: </b> ${email.recipients}</div>
    <div class="vertical-space"><b>Subject: </b> ${email.subject}</div>
    <div class="vertical-space"><b>Timestamp: </b> ${email.timestamp}</div>
    <button class="btn btn-sm btn-outline-primary" id="inbox" class="inline">Reply</button>
    <div id="archive_button" class="inline"></div>
    <hr>
    ${email.body}
  `;

    const archive_button = document.createElement('div');
    if(!email.archived){
        archive_button.innerHTML=`<button class="btn btn-sm btn-outline-warning" id="archive">Archive</button>`;
    }
    else{
        archive_button.innerHTML=`<button class="btn btn-sm btn-outline-danger" id="archive">Unarchive</button>`;
    }

    archive_button.addEventListener('click', function() {
            void fetch(`/emails/${email.id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    archived: !email.archived
                })
            });
    });
    document.querySelector('#archive_button').append(archive_button);
}


function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#individual-view').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#individual-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  fetch(`/emails/${mailbox}`)
      .then(response => response.json())
      .then(allemails => {
        allemails.forEach(email => {
          const element = document.createElement('div');

          // To account for read and unread (make background gray if read)
          let top;
          if (email.read) {
            top = `<div class="list-group-item" style="height: 45px; background: #9e9d9d">`;
          } else {
            top = `<div class="list-group-item" style="height: 45px;">`;
          }

          element.innerHTML =`${top}
              <b class="inline">From: ${email.sender} &emsp;</b>
              <p class="inline">${email.subject}</p>
              <p class="timestamp" class="inline">${email.timestamp}</p>
            </div>`;

          element.addEventListener('click', function (){
             open_email(email);
          }
          );
          document.querySelector('#emails-view').append(element);
        });
      });
}

function sendEmail(){
  event.preventDefault();
  console.log("SEND");

  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body
    })
  })
      .then(response => response.json())
      .then(result => {
        // Print result
        console.log(result);
        load_mailbox('sent');
      });
}

