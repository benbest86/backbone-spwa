(function(){
  
  // MODELS
  // The model that will store our contact information.
  var Contact = Backbone.Model.extend({
    htmlId: function() {
      return "contact_" + this.cid;
    },
    
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
    comparator : function(model) { return model.get('name'); }
  });
  
  // Instantiate ContactStore, so that we can pre-populate the Collection.
  var contacts = new ContactStore();
  
  // VIEWS
  var ContactDetailView = Backbone.SPWA.View.extend({
    el: $('#contact_details'),
    contactDetailTemplate: _.template($('#contact-template').html()),
    
    render : function() {
      this.el.html(this.contactDetailTemplate({model: this.model}));
    }
  });
  
  var ContactListView = Backbone.SPWA.View.extend({
    el: $('#contact_list'),
    collection: contacts,
    contactListTemplate: _.template($('#contact_list-template').html()),
    
    render : function() {
      this.el.html(this.contactListTemplate({collection: this.collection}));
      this.el.find('li:odd').addClass('odd');
      this.el.find('li:even').addClass('even')
    }
  });
  
  var ContactFormView = Backbone.SPWA.View.extend({
    el: $('#contact_form'),
    contactFormTemplate: _.template($('#contact_form-template').html()),
    model: '',
    
    events : {
      'click #save' : 'saveContact'
    },
    
    initialize : function() {
      this.handleEvents();
    },
  
    render : function() {
      this.el.html(this.contactFormTemplate({model: this.model}));
    }, 
    
    saveContact : function() {
      var inputs = this.el.find('input[type=text]');
      var data = {};
      
      _.each(inputs, function(input){
        data[input.name] = input.value;
      });
      
      this.model.set(data);
      location.hash = '/';
    }
  });
  
  // Controller
  var Controller = Backbone.SPWA.Controller.extend({
    routes : {
      '/' : 'showContactList',
      '/details' : 'showContactDetails',
      '/edit' : 'editContact',
      '/destroy' : 'destroyContact',
      '/new' : 'newContact'
    },
    
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
    },
    
    showContactList : function(args) {
      this.hideAll();
      var view = this.getView('ContactList');
      view.show();
      $('#search_input').focus();
    },
    
    showContactDetails : function(args) {
      this.hideAll();
      var view = this.getView('ContactDetails');
      view.model = contacts.getByCid(args.cid); 
      view.show();
    },
    
    editContact : function(args) {
      this.showContactForm(contacts.getByCid(args.cid));
    },
    
    newContact : function(args) {
      var model = new Contact()
      contacts.add(model);
      this.showContactForm(model);
    },
    
    showContactForm : function (model) {
      this.hideAll();
      var view = this.getView('ContactForm');
      view.model = model; 
      view.show();
    },
    
    destroyContact : function(args) {
      contact = contacts.getByCid(args.cid);
      
      var yn = confirm("Go ahead and delete " + contact.get('name') + " from your contacts?");
      if(yn == true) { contacts.remove(args.cid); }
      location.hash = '/';
      this.showContactList();
    }
  });
  
  // Initialize our application
  app = new Controller();
  
  // Signal a hashchange, to start the app router.
  $(document).ready(function() {
    $(window).hashchange();
  });
  
})();