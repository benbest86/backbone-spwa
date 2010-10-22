(function(){
  
  // MODELS
  // The model that will store our contact information.
  var Contact = Backbone.Model.extend({
    
    // Format the phone number into a pretty format.
    prettyPhone: function() {
      var phone = this.get('phone') 
      var area = phone.substr(0,3);
      var prefix = phone.substr(3,3);
      var number = phone.substr(6,4);
      
      return '('+area+') '+prefix+'-'+number;
    }
  });
  
  // A collection wrapper around our Contact model.
  var ContactStore = Backbone.Collection.extend({
    model: Contact,
    // The name will be the default comparator.
    comparator : function(model) { return model.get('name'); }
  });
  
  // Instantiate ContactStore, so that we can pre-populate the Collection.
  var contacts = new ContactStore();
  
  // VIEWS
  
  // Main view - Lists contacts, is called when hash is set to #/ or no hash.
  var ContactListView = Backbone.SPWA.View.extend({
    el: $('#contact_list'),
    collection: contacts,
    contactListTemplate: _.template($('#contact_list-template').html()),
    
    render : function() {
      // Render the template, and zebra stripe the ul.
      this.el.html(this.contactListTemplate({collection: this.collection}));
      this.el.find('li:odd').addClass('odd');
      this.el.find('li:even').addClass('even')
    }
  });
  
  // Detail view -  shows contacts details and gives them the option to edit/destroy.
  var ContactDetailView = Backbone.SPWA.View.extend({
    el: $('#contact_details'),
    contactDetailTemplate: _.template($('#contact-template').html()),
    
    render : function() {
      this.el.html(this.contactDetailTemplate({model: this.model}));
    }
  });
  
  // Contact Form - Will be used for both new contacts as well as editing existing contacts.
  var ContactFormView = Backbone.SPWA.View.extend({
    el: $('#contact_form'),
    contactFormTemplate: _.template($('#contact_form-template').html()),
    model: '',
    
    events : { 'click #save' : 'saveContact' },
    
    initialize : function() { this.handleEvents(); },
  
    render : function() {
      // We'll set the model to the contact we want to edit in the controller.
      // If we're creating a new contact, then the model will be un-set
      // so we need to instantiate a new contact model.
      if(!this.model) { this.model = new Contact({}); }
      this.el.html(this.contactFormTemplate({model: this.model}));
    }, 
    
    saveContact : function() {
      // Get the data from the form and serialize it into a data object.
      var inputs = this.el.find('input[type=text]');
      var data = {};
      _.each(inputs, function(input){
        data[input.name] = input.value;
      });
      
      // Set the data for the model. If it's not in the contacts store, add it.
      this.model.set(data);
      if(!contacts.getByCid(this.model.cid)) { contacts.add(this.model); }
      
      // Forward back to the contact list.
      location.hash = '/';
    }
  });
  
  // Controller - Essentially our application.
  var Controller = Backbone.SPWA.Controller.extend({
    
    // Set-up routes. This is like event-handling, but based from the hash tag on the url. 
    // For example, if we set up a route of: 'doStuff' : 'doStuffHandler'
    // and then went to the url of http://www.mywebapp.com/index.html#/doStuff
    // doStuffHandler would be called. You can also specify variables in the hash:
    // http://www.mywebapp.com/index.html#/doStuff?foo=1&bar=2
    // doStuffHandler will now recieve an args object containing:
    // { foo: 1, bar: 2 }
    
    routes : {
      '/' : 'showContactList',
      '/details' : 'showContactDetails',
      '/edit' : 'editContact',
      '/destroy' : 'destroyContact',
      '/new' : 'newContact'
    },
    
    // The views that we want this controller to instantiate and track.
    views : {
      'ContactList': ContactListView,
      'ContactDetails' : ContactDetailView,
      'ContactForm' : ContactFormView
    },
    
    initialize : function() {
      // Pre-populate with some interesting contacts.
      contacts.add(new Contact({ 
        name : 'Barack Obama', 
        address: '1600 Pennsylvania Avenue NW, Washington, DC 20500', 
        phone: '5559872938',
        email: 'barack.obama@whitehouse.gov'
      }));
        
      contacts.add(new Contact({ 
        name : 'George W. Bush',
        address: '1229 N Some St, Dallas, TX 75201',
        phone: '5552989485',
        email: 'w@yahoo.com',
      }));
      
      contacts.add(new Contact({ 
        name : 'Bill Clinton',
        address: '9487 W 6th Ave, New York, NY 10001',
        phone: '5554658878',
        email: 'bill@hotmail.com'
      }));
      
      // Bind change on #search_input and make sure this refers to this controller.
      var controller = this;
      $('#search_input').change(function(){ controller.searchContacts(); });
    },
    
    // Perform a search on the contacts collection.
    searchContacts : function() {
      var term = $('#search_input').val();
      var regex = new RegExp(term,'i');
      
      // _.select will return each model in an array that matches our regex.
      var matches = _.select(contacts.models, function(model){
        return model.get('name').match(regex);
      });
      
      // No matches, display error. Clear search box.
      if(matches.length == 0) { alert('No contacts matched your search criteria.'); $('#search_input').val(''); }
      // One match, forward them to the contact's detais. Clear search box.
      if(matches.length == 1) { location.hash = '#/details?cid=' + matches[0].cid; $('#search_input').val(''); }
      // More than one match, re-display contact list with a new collection, of just these matches.
      if(matches.length > 1) { this.showContactList({ collection: new ContactStore(matches) }); }
    },
    
    // Default route. Show contact list.
    showContactList : function(args) {
      
      // Hides all views listed in the views above. 
      // This way no view but the one we want is showing.
      this.hideAll();
      
      // Get the instantiated view
      var view = this.getView('ContactList');
      
      // If they've done a search, args will have a collection of those contacts that match
      // so set the ContactList collection to args.collection.
      if(args.collection) { view.collection = args.collection; }
      
      // Otherwise set it to all contacts.
      else { view.collection = contacts; }
      
      // Show the view, show will also call .render
      view.show();
      
      // Focus input on the search box.
      $('#search_input').focus();
    },
    
    // Details view - nothing new here.
    showContactDetails : function(args) {
      this.hideAll();
      var view = this.getView('ContactDetails');
      view.model = contacts.getByCid(args.cid); 
      view.show();
    },
    
    // Edit contact and new contact are similar, except that 
    // new contact sets the model to undefined, whereas edit 
    // sets it to the contact we want to edit.
    editContact : function(args) {
      this.showContactForm(contacts.getByCid(args.cid));
    },
    
    newContact : function(args) {
      this.showContactForm(undefined);
    },
    
    showContactForm : function (model) {
      this.hideAll();
      var view = this.getView('ContactForm');
      view.model = model; 
      view.show();
    },
    
    // Called when we want to delete a contact.
    destroyContact : function(args) {
      // Get the contact
      contact = contacts.getByCid(args.cid);
      
      // Make sure the user really wants to delete it.
      var yn = confirm("Go ahead and delete " + contact.get('name') + " from your contacts?");
      if(yn == true) { contacts.remove(args.cid); }
      location.hash = '/';
      this.showContactList();
    }
  });
  
  // Initialize our application
  var app = new Controller();
  
  // Signal a hashchange, to start the app router.
  $(document).ready(function() {
    $(window).hashchange();
  });
  
})();