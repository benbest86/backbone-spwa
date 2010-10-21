(function(){
  
  // MODELS
  // The model that will store our contact information.
  var Contact = Backbone.Model.extend({
    htmlId: function() {
      return "contact_" + this.cid;
    }
  });
  
  // A collection wrapper around our Contact model.
  var ContactStore = Backbone.Collection.extend({ model: Contact });
  
  // Instantiate ContactStore, so that we can pre-populate the Collection.
  var contacts = new ContactStore();
  
  // VIEWS
  var ContactDetailView = Backbone.SPWA.View.extend({
    contactTemplate: _.template($('#contact-template').html()),
    model: Contact,
    
    render : function() {
     
     $(this.el).html(this.contactTemplate({collection: this.collection}));
    }
  });
  
  // Top-level view
  var ContactListView = Backbone.SPWA.View.extend({
    el: $('#contact_list'),
    collection: contacts,
    contactListTemplate: _.template($('#contact_list-template').html()),
    
    subviews : {
      'ContactDetail' : ContactDetailView
    },
    
    events : {
      'click li' : 'showContact',
    },
    
    initialize : function() {
      this.handleEvents();
    },
    
    render : function() {
      this.el.html(this.contactListTemplate({collection: this.collection}));
      this.el.find('li:odd').addClass('odd');
      this.el.find('li:even').addClass('even')
    },
    
    showContact : function(event, test) {
      var cid = event.target.id.split('_')[1];
      var contact = this.collection.getByCid(cid);
      alert(contact.get('name'));
    }
  });
  
  // Controller
  var Controller = Backbone.SPWA.Controller.extend({
    routes : {
      '/' : 'showContactList'
    },
    
    views : { 'ContactList': ContactListView },
    
    initialize : function() {
      // Pre-populate with some interesting contacts.
      contacts.add(new Contact({ name : 'Barack Obama', address: '1600 Pennsylvania Avenue NW, Washington, DC 20500' }));
      contacts.add(new Contact({ name : 'George W. Bush', address: '1229 N Some St, Dallas, TX 75201' }));
      contacts.add(new Contact({ name : 'Bill Clinton', address: '9487 W 6th Ave, New York, NY 10001' }));
    },
    
    showContactList : function(args) {
      this.hideAll();
      var view = this.getView('ContactList');
      view.show();
    }
  });
  
  // Initialize our application
  app = new Controller();
  
  // Signal a hashchange, to start the app router.
  $(document).ready(function() {
    $(window).hashchange();
  });
  
})();