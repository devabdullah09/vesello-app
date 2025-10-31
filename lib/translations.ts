export type Language = 'en' | 'pl';

export interface Translations {
  // Common
  common: {
    poweredBy: string;
    login: string;
    designedBy: string;
    submit: string;
    cancel: string;
    save: string;
    edit: string;
    delete: string;
    confirm: string;
    back: string;
    next: string;
    loading: string;
    error: string;
    success: string;
    onOff: string;
  };
  
  // Hero Section
  hero: {
    saveTheDate: string;
    gettingMarried: string;
    days: string;
    hours: string;
    minutes: string;
    seconds: string;
  };
  
  // RSVP Section
  rsvp: {
    title: string;
    subtitle: string;
    yourName: string;
    emailAddress: string;
    numberOfGuests: string;
    willYouAttend: string;
    acceptWithPleasure: string;
    declineWithRegret: string;
    leaveMessage: string;
    dietaryRestrictions: string;
    submitRsvp: string;
    sending: string;
    thankYou: string;
    receivedRsvp: string;
    guest: string;
    guests: string;
  };
  
  // Timeline Section
  timeline: {
    title: string;
    subtitle: string;
    welcomeToast: string;
    ceremony: string;
    weddingLunch: string;
    cakeCutting: string;
    firstDance: string;
    cocktailHour: string;
  };
  
  // Ceremony Section
  ceremony: {
    title: string;
    subtitle: string;
    date: string;
    time: string;
    location: string;
    description: string;
    details: string;
    viewOnMap: string;
  };
  
  // Venue Section
  venue: {
    title: string;
    subtitle: string;
    address: string;
    directions: string;
    description: string;
    viewOnMap: string;
    venueName: string;
  };
  
  // Seating Chart Section
  seating: {
    title: string;
    subtitle: string;
  };
  
  // Seating Chart Section (alternative name)
  seatingChart: {
    title: string;
    description: string;
    welcome: string;
    table: string;
  };
  
  // Menu Section
  menu: {
    title: string;
    subtitle: string;
    appetizers: string;
    mainCourse: string;
    desserts: string;
    beverages: string;
    description: string;
    dinner: string;
    porkChop: string;
    breaded: string;
    potatoes: string;
    withButter: string;
  };
  
  // Wishes and Gifts Section
  wishes: {
    title: string;
    subtitle: string;
    yourPresence: string;
    giftRegistry: string;
    monetaryGifts: string;
  };
  
  // Wishes and Gifts Section (alternative name)
  wishesGifts: {
    title: string;
    description: string;
    place: string;
    when: string;
    giftsPreferences: string;
    wishes: string;
    gratitudeMessage: string;
  };
  
  // Team Section
  team: {
    title: string;
    subtitle: string;
    bridesmaids: string;
    groomsmen: string;
    parents: string;
    description: string;
  };
  
  // Accommodation Section
  accommodation: {
    title: string;
    subtitle: string;
    hotelName: string;
    address: string;
    phone: string;
    bookingCode: string;
    specialRates: string;
    description: string;
    noInfo: string;
  };
  
  // Transportation Section
  transportation: {
    title: string;
    subtitle: string;
    shuttleService: string;
    parking: string;
    publicTransport: string;
    description: string;
    noInfo: string;
  };
  
  // Additional Info Section
  additionalInfo: {
    title: string;
    subtitle: string;
    dressCode: string;
    weather: string;
    contact: string;
    description: string;
    dietaryRestrictions: string;
    weatherPolicy: string;
  };
  
  
  // Gallery
  gallery: {
    title: string;
    subtitle: string;
    uploadPhotos: string;
    selectPhotos: string;
    dragDrop: string;
    uploading: string;
    uploadComplete: string;
    uploadError: string;
    deletePhoto: string;
    confirmDelete: string;
    album: string;
    albums: string;
    createAlbum: string;
    albumName: string;
    albumDescription: string;
    addPhotos: string;
    removePhoto: string;
    editAlbum: string;
    deleteAlbum: string;
    noPhotos: string;
    noAlbums: string;
    loading: string;
    error: string;
    success: string;
    tags: string;
    addTag: string;
    removeTag: string;
    filterByTag: string;
    allPhotos: string;
    recentPhotos: string;
    featuredPhotos: string;
      photos: string;
      videos: string;
      shareMemories: string;
      uploadedYet: string;
      uploadFirst: string;
      photo: string;
      video: string;
      notAvailable: string;
      welcomeTo: string;
      wedding: string;
      weddingDay: string;
      partyDay: string;
      gotPhotos: string;
      addThemNow: string;
      upload: string;
      photosUploaded: string;
      videosUploaded: string;
      knowSomeone: string;
      copyPartyLink: string;
      linkCopied: string;
      exclusiveLink: string;
      shareOnly: string;
      uploadPhotosVideos: string;
      uploadedBy: string;
      signYour: string;
      your: string;
      masterpiece: string;
      rememberWhoLeft: string;
      selectAlbumToUpload: string;
      afterParty: string;
      toggleDescription: string;
  };
  
  // Invitation Flow
  invitation: {
    welcome: string;
    rsvp: string;
    attendance: string;
    decline: string;
    foodSelection: string;
    accommodation: string;
    transportation: string;
    afterParty: string;
    note: string;
    confirmation: string;
    next: string;
    back: string;
    submit: string;
    thankYou: string;
    yourResponse: string;
    dietaryRestrictions: string;
    specialRequests: string;
    hotelBooking: string;
    shuttleService: string;
    parking: string;
    publicTransport: string;
    dressCode: string;
    gifts: string;
    contact: string;
    // Additional RSVP page translations
    weddingDay: string;
    afterPartyTitle: string;
    mealPreference: string;
    whatsYour: string;
    needAccommodation: string;
    doYouNeed: string;
    needTransportation: string;
    toOurWeddingDay: string;
    sendNote: string;
    toTheCouple: string;
    willAttend: string;
    cantAttend: string;
    continue: string;
    skip: string;
    regular: string;
    vegetarian: string;
    vegan: string;
    yes: string;
    no: string;
    writeMessage: string;
    allSet: string;
    heresWhatWeSent: string;
    yourRsvpResponse: string;
    weddingAfterDayParty: string;
    noGuestsAttending: string;
    addPlusOnes: string;
    household: string;
    isItChild: string;
    addGuests: string;
    name: string;
    surname: string;
    age: string;
    respondingFor: string;
    entireGroup: string;
  };
  
  // Event Pages
  event: {
    title: string;
    subtitle: string;
    date: string;
    time: string;
    location: string;
    address: string;
    directions: string;
    rsvp: string;
    gallery: string;
    timeline: string;
    menu: string;
    accommodation: string;
    transportation: string;
    gifts: string;
    contact: string;
    share: string;
    copyLink: string;
    loading: string;
    error: string;
    notFound: string;
  };
  
  // Forms
  forms: {
    name: string;
    email: string;
    phone: string;
    message: string;
    required: string;
    optional: string;
    submit: string;
    cancel: string;
    save: string;
    edit: string;
    delete: string;
    confirm: string;
    loading: string;
    error: string;
    success: string;
    validation: {
      required: string;
      email: string;
      phone: string;
      minLength: string;
      maxLength: string;
    };
  };
  
  // Login
  login: {
    loginToAccount: string;
    enterEmail: string;
    password: string;
    forgot: string;
    enterPassword: string;
    loginNow: string;
    loggingIn: string;
    pleaseEnterBoth: string;
    loginFailed: string;
  };
  
  // Navigation
  navigation: {
    home: string;
    events: string;
    gallery: string;
    rsvp: string;
    dashboard: string;
    login: string;
    logout: string;
    profile: string;
    settings: string;
    help: string;
    contact: string;
  };

  // Dashboard
  dashboard: {
    adminDashboard: string;
    superAdmin: string;
    organizer: string;
    events: string;
    eventsEdition: string;
    eventsList: string;
    organizers: string;
    clientsList: string;
    modulesList: string;
    webhooksList: string;
    subscription: string;
    manage: string;
    back: string;
    logout: string;
    analytics: string;
    activeEvents: string;
    pending: string;
    eventDashboard: string;
    manageEvent: string;
    changePassword: string;
    eventOverview: string;
    eventTitle: string;
    coupleNames: string;
    eventDate: string;
    venue: string;
    copyLink: string;
    downloadQR: string;
    availableFeatures: string;
    gallery: string;
    rsvp: string;
    enabled: string;
    disabled: string;
    required: string;
    editWebsite: string;
    generalInfo: string;
    dayDetails: string;
    galleryManagement: string;
    rsvpManagement: string;
    eventSettings: string;
    manageSubscription: string;
    billingHistory: string;
    eventManagement: string;
    dashboard: string;
    copyLinkAndInvite: string;
    downloadQRAndShare: string;
    eventDetailsPage: string;
    eventMainPage: string;
    withGuests: string;
    // Additional common keys
    title: string;
    createEvent: string;
    editEvent: string;
    deleteEvent: string;
    eventName: string;
    eventStatus: string;
    actions: string;
    save: string;
    cancel: string;
    delete: string;
    confirm: string;
    loading: string;
    error: string;
    success: string;
    noEvents: string;
    createNewEvent: string;
    eventDetails: string;
    settings: string;
    preview: string;
    publish: string;
    unpublish: string;
    share: string;
    guests: string;
    responses: string;
    confirmed: string;
    declined: string;
  };
  
  // Status Messages
  status: {
    loading: string;
    error: string;
    success: string;
    warning: string;
    info: string;
    noData: string;
    notFound: string;
    unauthorized: string;
    forbidden: string;
    serverError: string;
    networkError: string;
    tryAgain: string;
    refresh: string;
    notAvailable: string;
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    common: {
      poweredBy: 'Powered by Vesello',
      login: 'LOGIN',
      designedBy: 'Designed by',
      submit: 'Submit',
      cancel: 'Cancel',
      save: 'Save',
      edit: 'Edit',
      delete: 'Delete',
      confirm: 'Confirm',
      back: 'Back',
      next: 'Next',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      onOff: 'On and Off',
    },
    hero: {
      saveTheDate: 'Save The Date',
      gettingMarried: "WE'RE GETTING MARRIED!",
      days: 'DAYS',
      hours: 'HOURS',
      minutes: 'MINUTES',
      seconds: 'SECONDS',
    },
    rsvp: {
      title: 'RSVP',
      subtitle: 'We hope you can join us on our special day',
      yourName: 'Your Name',
      emailAddress: 'Email Address',
      numberOfGuests: 'Number of Guests',
      willYouAttend: 'Will you attend?',
      acceptWithPleasure: 'Accept with pleasure',
      declineWithRegret: 'Decline with regret',
      leaveMessage: 'Leave us a message (optional)',
      dietaryRestrictions: 'Any dietary restrictions or special requests?',
      submitRsvp: 'Submit RSVP',
      sending: 'Sending...',
      thankYou: 'Thank You!',
      receivedRsvp: "We've received your RSVP. We look forward to celebrating with you!",
      guest: 'Guest',
      guests: 'Guests',
    },
    seating: {
      title: 'Seating Chart',
      subtitle: 'Find your place at our celebration',
    },
    wishes: {
      title: 'Wishes & Gifts',
      subtitle: 'Your presence is the greatest gift',
      yourPresence: 'Your presence is the greatest gift',
      giftRegistry: 'Gift Registry',
      monetaryGifts: 'Monetary Gifts',
    },
    team: {
      title: 'Wedding Party',
      subtitle: 'Meet our amazing team',
      bridesmaids: 'Bridesmaids',
      groomsmen: 'Groomsmen',
      parents: 'Parents',
      description: 'Meet the special people who will be part of our big day.',
    },
    accommodation: {
      title: 'Accommodation',
      subtitle: 'Where to stay',
      hotelName: 'Hotel Name',
      address: 'Address',
      phone: 'Phone',
      bookingCode: 'Booking Code',
      specialRates: 'Special Rates',
      description: 'Here are some hotel options for out-of-town guests.',
      noInfo: 'No accommodation information available yet.',
    },
    transportation: {
      title: 'Transportation',
      subtitle: 'Getting to the venue',
      shuttleService: 'Shuttle Service',
      parking: 'Parking',
      publicTransport: 'Public Transport',
      description: 'Information about getting to and from the venue.',
      noInfo: 'No transportation information available yet.',
    },
    additionalInfo: {
      title: 'Additional Information',
      subtitle: 'Everything you need to know',
      dressCode: 'Dress Code',
      weather: 'Weather',
      contact: 'Contact',
      description: 'Here you can find any additional details about our wedding day.',
      dietaryRestrictions: 'Please Let Us Know Of Any Dietary Restrictions By August 15th.',
      weatherPolicy: 'The Wedding Will Be Held Rain Or Shine, But The Ceremony Will Be Moved Indoors In Case Of Bad Weather.',
    },
    gallery: {
      title: 'Gallery',
      subtitle: 'Photos from our special day',
      uploadPhotos: 'Upload Photos',
      selectPhotos: 'Choose Files',
      dragDrop: 'Drag and drop photos here',
      uploading: 'Uploading...',
      uploadComplete: 'Upload Complete',
      uploadError: 'Upload Error',
      deletePhoto: 'Delete Photo',
      confirmDelete: 'Are you sure you want to delete this photo?',
      album: 'Album',
      albums: 'Albums',
      createAlbum: 'Create Album',
      albumName: 'Album Name',
      albumDescription: 'Album Description',
      addPhotos: 'Add Photos',
      removePhoto: 'Remove Photo',
      editAlbum: 'Edit Album',
      deleteAlbum: 'Delete Album',
      noPhotos: 'No',
      noAlbums: 'No albums',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      tags: 'Tags',
      addTag: 'Add Tag',
      removeTag: 'Remove Tag',
      filterByTag: 'Filter by Tag',
      allPhotos: 'All Photos',
      recentPhotos: 'Recent Photos',
      featuredPhotos: 'Featured Photos',
      photos: 'Photos',
      videos: 'Videos',
      shareMemories: 'Share your memories from',
      uploadedYet: 'uploaded yet',
      uploadFirst: 'Upload First',
      photo: 'Photo',
      video: 'Video',
      notAvailable: 'Not Available',
      welcomeTo: 'Welcome To The',
      wedding: 'Wedding',
      weddingDay: 'Wedding Day',
      partyDay: 'Party Day',
      gotPhotos: 'Got Photos?',
      addThemNow: 'Add Them Now!',
      upload: 'Upload',
      photosUploaded: 'photos uploaded',
      videosUploaded: 'videos uploaded',
      knowSomeone: "Psst! Know Someone Who'd Kill To Be Here?",
      copyPartyLink: 'Copy Party Link',
      linkCopied: 'Link Copied!',
      exclusiveLink: 'This Link Is As Exclusive As Your Invite.',
      shareOnly: 'Please Share Only With Fellow Guests!',
      signYour: 'Sign',
      your: 'Your',
      masterpiece: 'Masterpiece',
      rememberWhoLeft: "We'd Love To Remember Who Left This Gem!",
      selectAlbumToUpload: 'Select An Album To Upload To',
      afterParty: 'After Party',
      uploadPhotosVideos: 'UPLOAD PHOTOS/VIDEOS',
      uploadedBy: 'Uploaded By',
      toggleDescription: 'You can on and off this section on website.',
    },
    invitation: {
      welcome: 'Welcome',
      rsvp: 'RSVP',
      attendance: 'Will Attend',
      decline: "Can't Attend",
      foodSelection: 'Food Selection',
      accommodation: 'Accommodation',
      transportation: 'Transportation',
      afterParty: 'After Party',
      note: 'Note',
      confirmation: 'Confirmation',
      next: 'Next',
      back: 'Back',
      submit: 'Submit',
      thankYou: 'Thank You',
      yourResponse: 'Your Response',
      dietaryRestrictions: 'Dietary Restrictions',
      specialRequests: 'Special Requests',
      hotelBooking: 'Hotel Booking',
      shuttleService: 'Shuttle Service',
      parking: 'Parking',
      publicTransport: 'Public Transport',
      dressCode: 'Dress Code',
      gifts: 'Gifts',
      contact: 'Contact',
      // Additional RSVP page translations
      weddingDay: 'Wedding Day',
      afterPartyTitle: 'After Party',
      mealPreference: 'Meal Preference?',
      whatsYour: 'What\'s Your',
      needAccommodation: 'Accommodation',
      doYouNeed: 'Do You Need',
      needTransportation: 'Transportation',
      toOurWeddingDay: 'To Our Wedding Day?',
      sendNote: 'Send A Note',
      toTheCouple: 'To The Couple',
      willAttend: 'Will Attend',
      cantAttend: 'Can\'t Attend',
      continue: 'Continue',
      skip: 'Skip',
      regular: 'Regular',
      vegetarian: 'Vegetarian',
      vegan: 'Vegan',
      yes: 'Yes',
      no: 'No',
      writeMessage: 'Write your message here...',
      allSet: 'All Set! Here\'s what we sent',
      heresWhatWeSent: 'Lucas & Mia.',
      yourRsvpResponse: 'Your RSVP Response',
      weddingAfterDayParty: 'Wedding After Day Party',
      noGuestsAttending: 'No guests attending',
      addPlusOnes: 'Add Plus Ones or Household',
      household: 'Household',
      isItChild: 'Is it a child?',
      addGuests: 'Add Guests',
      name: 'Name',
      surname: 'Surname',
      age: 'Age',
      respondingFor: 'If you\'re responding for you and a guest (or your family),',
      entireGroup: 'you\'ll be able to RSVP for your entire group.',
    },
    event: {
      title: 'Event',
      subtitle: 'Event details',
      date: 'Date',
      time: 'Time',
      location: 'Location',
      address: 'Address',
      directions: 'Directions',
      rsvp: 'RSVP',
      gallery: 'Gallery',
      timeline: 'Timeline',
      menu: 'Menu',
      accommodation: 'Accommodation',
      transportation: 'Transportation',
      gifts: 'Gifts',
      contact: 'Contact',
      share: 'Share',
      copyLink: 'Copy Link',
      loading: 'Loading...',
      error: 'Error',
      notFound: 'Not Found',
    },
    forms: {
      name: 'Name',
      email: 'Email',
      phone: 'Phone',
      message: 'Message',
      required: 'Required',
      optional: 'Optional',
      submit: 'Submit',
      cancel: 'Cancel',
      save: 'Save',
      edit: 'Edit',
      delete: 'Delete',
      confirm: 'Confirm',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      validation: {
        required: 'This field is required',
        email: 'Please enter a valid email address',
        phone: 'Please enter a valid phone number',
        minLength: 'Minimum {min} characters',
        maxLength: 'Maximum {max} characters',
      },
    },
    login: {
      loginToAccount: 'Login to your account',
      enterEmail: 'Enter your email',
      password: 'Password',
      forgot: 'Forgot ?',
      enterPassword: 'Enter your password',
      loginNow: 'Login now',
      loggingIn: 'Logging in...',
      pleaseEnterBoth: 'Please enter both email and password.',
      loginFailed: 'Login failed. Please check your credentials.',
    },
    navigation: {
      home: 'Home',
      events: 'Events',
      gallery: 'Gallery',
      rsvp: 'RSVP',
      dashboard: 'Dashboard',
      login: 'Login',
      logout: 'Logout',
      profile: 'Profile',
      settings: 'Settings',
      help: 'Help',
      contact: 'Contact',
    },
    dashboard: {
      adminDashboard: 'ADMIN DASHBOARD',
      superAdmin: 'Super Admin',
      organizer: 'Organizer',
      events: 'Events',
      eventsEdition: 'EVENTS EDITION',
      eventsList: 'EVENTS LIST',
      organizers: 'ORGANIZERS',
      clientsList: 'CLIENTS LIST',
      modulesList: 'MODULES LIST',
      webhooksList: 'WEBHOOKS LIST',
      subscription: 'SUBSCRIPTION',
      manage: 'Manage',
      back: 'Back',
      logout: 'Logout',
      analytics: 'Analytics',
      activeEvents: 'Active Events',
      pending: 'Pending RSVPs',
      eventDashboard: 'Event Dashboard',
      manageEvent: 'Manage your assigned event',
      changePassword: 'Change Password',
      eventOverview: 'Event Overview',
      eventTitle: 'Event Title',
      coupleNames: 'Couple Names',
      eventDate: 'Event Date',
      venue: 'Venue',
      copyLink: 'Copy Link',
      downloadQR: 'Download QR Code',
      availableFeatures: 'Available Features',
      gallery: 'Gallery',
      rsvp: 'RSVP',
      enabled: 'Enabled',
      disabled: 'Disabled',
      required: 'required',
      editWebsite: 'Edit Website',
      generalInfo: 'EVENT\'S GENERAL INFO',
      dayDetails: 'EVENT\'S DAY DETAILS MANAGEMENT',
      galleryManagement: 'GALLERY MANAGEMENT',
      rsvpManagement: 'RSVP MANAGEMENT',
      eventSettings: 'EVENT SETTINGS',
      manageSubscription: 'MANAGE SUBSCRIPTION',
      billingHistory: 'BILLING HISTORY',
      eventManagement: 'EVENT MANAGEMENT',
      dashboard: 'DASHBOARD',
      copyLinkAndInvite: 'Copy the link and invite guests to your event details page',
      downloadQRAndShare: 'Download the QR code and share the event\'s main page with your guests:',
      eventDetailsPage: 'event details page',
      eventMainPage: 'event\'s main page',
      withGuests: 'with your guests',
      // Additional common keys
      title: 'Dashboard',
      createEvent: 'Create Event',
      editEvent: 'Edit Event',
      deleteEvent: 'Delete Event',
      eventName: 'Event Name',
      eventStatus: 'Event Status',
      actions: 'Actions',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      confirm: 'Confirm',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      noEvents: 'No events found',
      createNewEvent: 'Create New Event',
      eventDetails: 'Event Details',
      settings: 'Settings',
      preview: 'Preview',
      publish: 'Publish',
      unpublish: 'Unpublish',
      share: 'Share',
      guests: 'Guests',
      responses: 'Responses',
      confirmed: 'Confirmed',
      declined: 'Declined',
    },
    status: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      warning: 'Warning',
      info: 'Info',
      noData: 'No data',
      notFound: 'Not Found',
      unauthorized: 'Unauthorized',
      forbidden: 'Forbidden',
      serverError: 'Server Error',
      networkError: 'Network Error',
      tryAgain: 'Try Again',
      refresh: 'Refresh',
      notAvailable: 'Not Available',
    },
    // Timeline Section
    timeline: {
      title: 'Wedding Day Timeline',
      subtitle: 'Wedding Day Timeline',
      welcomeToast: 'WELCOME TOAST',
      ceremony: 'CEREMONY',
      weddingLunch: 'WEDDING LUNCH',
      cakeCutting: 'CAKE CUTTING',
      firstDance: 'FIRST DANCE',
      cocktailHour: 'COCKTAIL HOUR',
    },
    // Ceremony Section
    ceremony: {
      title: 'Ceremony',
      subtitle: 'Join us for our wedding ceremony',
      description: 'Join us as we exchange vows in a beautiful ceremony.',
      details: 'Ceremony Details',
      date: 'WEDNESDAY, NOVEMBER 12, 2025',
      time: '12:00 PM',
      location: '34-745 SPYTKOWICE',
      viewOnMap: 'View on Map',
    },
    // Venue Section
    venue: {
      title: 'Wedding Venue',
      subtitle: 'Where the magic happens',
      address: 'Address',
      directions: 'Directions',
      venueName: 'HILL WEASLY',
      description: 'A beautiful location for our special day.',
      viewOnMap: 'View on Map',
    },
    // Menu Section
    menu: {
      title: 'Wedding Food Menu',
      subtitle: 'Our Wedding',
      appetizers: 'Appetizers',
      mainCourse: 'Main Course',
      desserts: 'Desserts',
      beverages: 'Beverages',
      description: 'Delicious food prepared specially for our celebration.',
      dinner: 'Dinner',
      porkChop: 'Pork Chop',
      breaded: 'breaded',
      potatoes: 'Potatoes',
      withButter: 'with butter',
    },
    // Wishes & Gifts Section
    wishesGifts: {
      title: 'Wishes & Gifts',
      description: 'Your presence is the greatest gift, but if you wish to honor us with a gift, here are some suggestions.',
      place: 'Place',
      when: 'When',
      giftsPreferences: 'Gifts Preferences',
      wishes: 'Wishes',
      gratitudeMessage: 'We are so grateful for your love and support!',
    },
    // Seating Chart Section
    seatingChart: {
      title: 'Seating Chart',
      description: 'Find your seat for the reception.',
      welcome: 'Welcome',
      table: 'Table',
    },
  },
  pl: {
    common: {
      poweredBy: 'Napędzane przez Vesello',
      login: 'ZALOGUJ',
      designedBy: 'Zaprojektowane przez',
      submit: 'Wyślij',
      cancel: 'Anuluj',
      save: 'Zapisz',
      edit: 'Edytuj',
      delete: 'Usuń',
      confirm: 'Potwierdź',
      back: 'Wstecz',
      next: 'Dalej',
      loading: 'Ładowanie...',
      error: 'Błąd',
      success: 'Sukces',
      onOff: 'Włącz i Wyłącz',
    },
    hero: {
      saveTheDate: 'Zapisz Datę',
      gettingMarried: 'BIERZEMY ŚLUB!',
      days: 'DNI',
      hours: 'GODZINY',
      minutes: 'MINUTY',
      seconds: 'SEKUNDY',
    },
    rsvp: {
      title: 'RSVP',
      subtitle: 'Mamy nadzieję, że dołączycie do nas w tym wyjątkowym dniu',
      yourName: 'Twoje Imię',
      emailAddress: 'Adres Email',
      numberOfGuests: 'Liczba Gości',
      willYouAttend: 'Czy przyjdziecie?',
      acceptWithPleasure: 'Przyjmujemy z przyjemnością',
      declineWithRegret: 'Odmawiamy z żalem',
      leaveMessage: 'Zostaw nam wiadomość (opcjonalnie)',
      dietaryRestrictions: 'Jakieś ograniczenia żywieniowe lub specjalne prośby?',
      submitRsvp: 'Wyślij RSVP',
      sending: 'Wysyłanie...',
      thankYou: 'Dziękujemy!',
      receivedRsvp: 'Otrzymaliśmy Wasze RSVP. Nie możemy się doczekać świętowania z Wami!',
      guest: 'Gość',
      guests: 'Gości',
    },
    timeline: {
      title: 'Harmonogram Dnia Ślubu',
      subtitle: 'Harmonogram Dnia Ślubu',
      welcomeToast: 'TOAST POWITALNY',
      ceremony: 'CEREMONIA',
      weddingLunch: 'OBIAD ŚLUBNY',
      cakeCutting: 'KROJENIE TORTU',
      firstDance: 'PIERWSZY TANIEC',
      cocktailHour: 'GODZINA KOKTAJLI',
    },
    ceremony: {
      title: 'Ceremonia',
      subtitle: 'Dołączcie do nas na ceremonii ślubnej',
      date: 'Data',
      time: 'Godzina',
      location: 'Miejsce',
      description: 'Dołącz do nas podczas wymiany przysiąg w pięknej ceremonii.',
      details: 'Szczegóły Ceremonii',
      viewOnMap: 'Zobacz na mapie',
    },
    venue: {
      title: 'Miejsce Ślubu',
      subtitle: 'Gdzie dzieje się magia',
      address: 'Adres',
      directions: 'Jak dojechać',
      venueName: 'HILL WEASLY',
      description: 'Piękne miejsce na nasz wyjątkowy dzień.',
      viewOnMap: 'Zobacz na mapie',
    },
    seating: {
      title: 'Plan Stołów',
      subtitle: 'Znajdźcie swoje miejsce na naszym święcie',
    },
    menu: {
      title: 'Menu Ślubne',
      subtitle: 'Nasze Wesele',
      appetizers: 'Przystawki',
      mainCourse: 'Danie Główne',
      desserts: 'Desery',
      beverages: 'Napoje',
      description: 'Pyszne jedzenie przygotowane specjalnie na naszą uroczystość.',
      dinner: 'Obiad',
      porkChop: 'Schabowy',
      breaded: 'w panierce',
      potatoes: 'Ziemniaki',
      withButter: 'z masłem',
    },
    wishes: {
      title: 'Życzenia i Prezenty',
      subtitle: 'Wasza obecność to największy prezent',
      yourPresence: 'Wasza obecność to największy prezent',
      giftRegistry: 'Lista Prezentów',
      monetaryGifts: 'Prezenty Pieniężne',
    },
    wishesGifts: {
      title: 'Życzenia i Prezenty',
      description: 'Twoja obecność to największy prezent, ale jeśli chcesz nas uhonorować prezentem, oto kilka sugestii.',
      place: 'Miejsce',
      when: 'Kiedy',
      giftsPreferences: 'Preferencje Prezentów',
      wishes: 'Życzenia',
      gratitudeMessage: 'Jesteśmy tak wdzięczni za waszą miłość i wsparcie!',
    },
    team: {
      title: 'Zespół Ślubny',
      subtitle: 'Nasze Wesele',
      bridesmaids: 'Druhny',
      groomsmen: 'Drużbowie',
      parents: 'Rodzice',
      description: 'Poznaj wyjątkowe osoby, które będą częścią naszego wielkiego dnia.',
    },
    accommodation: {
      title: 'Nocleg',
      subtitle: 'Gdzie się zatrzymać',
      hotelName: 'Nazwa Hotelu',
      address: 'Adres',
      phone: 'Telefon',
      bookingCode: 'Kod Rezerwacji',
      specialRates: 'Specjalne Ceny',
      description: 'Oto kilka opcji hotelowych dla gości z daleka.',
      noInfo: 'Brak informacji o noclegu.',
    },
    transportation: {
      title: 'Transport',
      subtitle: 'Jak dojechać na miejsce',
      shuttleService: 'Bus Ślubny',
      parking: 'Parking',
      publicTransport: 'Transport Publiczny',
      description: 'Informacje o dotarciu do i z miejsca wydarzenia.',
      noInfo: 'Brak informacji o transporcie.',
    },
    additionalInfo: {
      title: 'Dodatkowe Informacje',
      subtitle: 'Wszystko co musicie wiedzieć',
      dressCode: 'Dress Code',
      weather: 'Pogoda',
      contact: 'Kontakt',
      description: 'Tutaj znajdziesz wszystkie dodatkowe szczegóły dotyczące naszego dnia ślubu.',
      dietaryRestrictions: 'Prosimy o informację o wszelkich ograniczeniach żywieniowych do 15 sierpnia.',
      weatherPolicy: 'Ślub odbędzie się niezależnie od pogody, ale w przypadku złej pogody ceremonia zostanie przeniesiona do środka.',
    },
    gallery: {
      title: 'Galeria',
      subtitle: 'Zdjęcia z naszego wyjątkowego dnia',
      uploadPhotos: 'Prześlij Zdjęcia',
      selectPhotos: 'Wybierz Pliki',
      dragDrop: 'Przeciągnij i upuść zdjęcia tutaj',
      uploading: 'Przesyłanie...',
      uploadComplete: 'Przesyłanie zakończone',
      uploadError: 'Błąd przesyłania',
      deletePhoto: 'Usuń Zdjęcie',
      confirmDelete: 'Czy na pewno chcesz usunąć to zdjęcie?',
      album: 'Album',
      albums: 'Albumy',
      createAlbum: 'Utwórz Album',
      albumName: 'Nazwa Albumu',
      albumDescription: 'Opis Albumu',
      addPhotos: 'Dodaj Zdjęcia',
      removePhoto: 'Usuń Zdjęcie',
      editAlbum: 'Edytuj Album',
      deleteAlbum: 'Usuń Album',
      noPhotos: 'Brak',
      noAlbums: 'Brak albumów',
      loading: 'Ładowanie...',
      error: 'Błąd',
      success: 'Sukces',
      tags: 'Tagi',
      addTag: 'Dodaj Tag',
      removeTag: 'Usuń Tag',
      filterByTag: 'Filtruj według tagu',
      allPhotos: 'Wszystkie Zdjęcia',
      recentPhotos: 'Ostatnie Zdjęcia',
      featuredPhotos: 'Wyróżnione Zdjęcia',
      photos: 'Zdjęcia',
      videos: 'Filmy',
      shareMemories: 'Podziel się wspomnieniami z',
      uploadedYet: 'jeszcze nie przesłano',
      uploadFirst: 'Prześlij Pierwsze',
      photo: 'Zdjęcie',
      video: 'Wideo',
      notAvailable: 'Niedostępne',
      welcomeTo: 'Witamy w',
      wedding: 'Weselu',
      weddingDay: 'Dzień Ślubu',
      partyDay: 'Dzień Imprezy',
      gotPhotos: 'Masz Zdjęcia?',
      addThemNow: 'Dodaj Je Teraz!',
      upload: 'Prześlij',
      photosUploaded: 'zdjęć przesłano',
      videosUploaded: 'filmów przesłano',
      knowSomeone: 'Psst! Znasz Kogoś, Kto Umierałby, Żeby Tu Być?',
      copyPartyLink: 'Skopiuj Link',
      linkCopied: 'Link Skopiowany!',
      exclusiveLink: 'Ten Link Jest Tak Ekskluzywny Jak Twoje Zaproszenie.',
      shareOnly: 'Proszę Udostępniaj Tylko Współgościom!',
      signYour: 'Podpisz',
      your: 'Swoje',
      masterpiece: 'Arcydzieło',
      rememberWhoLeft: 'Chcielibyśmy Pamiętać Kto Zostawił Ten Klejnot!',
      selectAlbumToUpload: 'Wybierz Album Do Przesłania',
      afterParty: 'After Party',
      uploadPhotosVideos: 'PRZEŚLIJ ZDJĘCIA/FILMY',
      uploadedBy: 'Przesłane Przez',
      toggleDescription: 'Możesz włączyć i wyłączyć tę sekcję na stronie.',
    },
    invitation: {
      welcome: 'Witamy',
      rsvp: 'RSVP',
      attendance: 'Będę',
      decline: 'Nie Mogę',
      foodSelection: 'Wybór Jedzenia',
      accommodation: 'Nocleg',
      transportation: 'Transport',
      afterParty: 'After Party',
      note: 'Notatka',
      confirmation: 'Potwierdzenie',
      next: 'Dalej',
      back: 'Wstecz',
      submit: 'Wyślij',
      thankYou: 'Dziękujemy',
      yourResponse: 'Twoja Odpowiedź',
      dietaryRestrictions: 'Ograniczenia Żywieniowe',
      specialRequests: 'Specjalne Prośby',
      hotelBooking: 'Rezerwacja Hotelu',
      shuttleService: 'Bus Ślubny',
      parking: 'Parking',
      publicTransport: 'Transport Publiczny',
      dressCode: 'Dress Code',
      gifts: 'Prezenty',
      contact: 'Kontakt',
      // Additional RSVP page translations
      weddingDay: 'Dzień Ślubu',
      afterPartyTitle: 'After Party',
      mealPreference: 'Preferencje Żywieniowe?',
      whatsYour: 'Jakie Są Twoje',
      needAccommodation: 'Nocleg',
      doYouNeed: 'Czy Potrzebujesz',
      needTransportation: 'Transportu',
      toOurWeddingDay: 'Na Nasz Dzień Ślubu?',
      sendNote: 'Wyślij Notatkę',
      toTheCouple: 'Do Pary',
      willAttend: 'Będę',
      cantAttend: 'Nie Mogę',
      continue: 'Dalej',
      skip: 'Pomiń',
      regular: 'Standardowe',
      vegetarian: 'Wegetariańskie',
      vegan: 'Wegańskie',
      yes: 'Tak',
      no: 'Nie',
      writeMessage: 'Napisz swoją wiadomość tutaj...',
      allSet: 'Wszystko Gotowe! Oto co wysłaliśmy',
      heresWhatWeSent: 'Lucas & Mia.',
      yourRsvpResponse: 'Twoja Odpowiedź RSVP',
      weddingAfterDayParty: 'After Party Ślubny',
      noGuestsAttending: 'Brak gości uczestniczących',
      addPlusOnes: 'Dodaj Osobę towarzyszącą lub Rodzinę',
      household: 'Rodzina',
      isItChild: 'Czy to dziecko?',
      addGuests: 'Dodaj Gości',
      name: 'Imię',
      surname: 'Nazwisko',
      age: 'Wiek',
      respondingFor: 'Jeśli odpowiadasz za siebie i gościa (lub swoją rodzinę),',
      entireGroup: 'będziesz mógł odpowiedzieć za całą grupę.',
    },
    event: {
      title: 'Wydarzenie',
      subtitle: 'Szczegóły wydarzenia',
      date: 'Data',
      time: 'Godzina',
      location: 'Miejsce',
      address: 'Adres',
      directions: 'Jak dojechać',
      rsvp: 'RSVP',
      gallery: 'Galeria',
      timeline: 'Harmonogram',
      menu: 'Menu',
      accommodation: 'Nocleg',
      transportation: 'Transport',
      gifts: 'Prezenty',
      contact: 'Kontakt',
      share: 'Udostępnij',
      copyLink: 'Skopiuj Link',
      loading: 'Ładowanie...',
      error: 'Błąd',
      notFound: 'Nie znaleziono',
    },
    forms: {
      name: 'Imię',
      email: 'Email',
      phone: 'Telefon',
      message: 'Wiadomość',
      required: 'Wymagane',
      optional: 'Opcjonalne',
      submit: 'Wyślij',
      cancel: 'Anuluj',
      save: 'Zapisz',
      edit: 'Edytuj',
      delete: 'Usuń',
      confirm: 'Potwierdź',
      loading: 'Ładowanie...',
      error: 'Błąd',
      success: 'Sukces',
      validation: {
        required: 'To pole jest wymagane',
        email: 'Podaj prawidłowy adres email',
        phone: 'Podaj prawidłowy numer telefonu',
        minLength: 'Minimum {min} znaków',
        maxLength: 'Maksimum {max} znaków',
      },
    },
    login: {
      loginToAccount: 'Zaloguj się do swojego konta',
      enterEmail: 'Wprowadź swój email',
      password: 'Hasło',
      forgot: 'Zapomniałeś ?',
      enterPassword: 'Wprowadź swoje hasło',
      loginNow: 'Zaloguj się teraz',
      loggingIn: 'Logowanie...',
      pleaseEnterBoth: 'Proszę wprowadzić zarówno email jak i hasło.',
      loginFailed: 'Logowanie nie powiodło się. Sprawdź swoje dane.',
    },
    navigation: {
      home: 'Strona Główna',
      events: 'Wydarzenia',
      gallery: 'Galeria',
      rsvp: 'RSVP',
      dashboard: 'Panel',
      login: 'Zaloguj',
      logout: 'Wyloguj',
      profile: 'Profil',
      settings: 'Ustawienia',
      help: 'Pomoc',
      contact: 'Kontakt',
    },
    dashboard: {
      adminDashboard: 'PANEL ADMINISTRACYJNY',
      superAdmin: 'Super Administrator',
      organizer: 'Organizator',
      events: 'Wydarzenia',
      eventsEdition: 'EDYCJA WYDARZEŃ',
      eventsList: 'LISTA WYDARZEŃ',
      organizers: 'ORGANIZATORZY',
      clientsList: 'LISTA KLIENTÓW',
      modulesList: 'LISTA MODUŁÓW',
      webhooksList: 'LISTA WEBHOOKÓW',
      subscription: 'SUBSKRYPCJA',
      manage: 'Zarządzaj',
      back: 'Wstecz',
      logout: 'Wyloguj',
      analytics: 'Analityka',
      activeEvents: 'Aktywne Wydarzenia',
      pending: 'Oczekujące RSVP',
      eventDashboard: 'Panel Wydarzenia',
      manageEvent: 'Zarządzaj przypisanym wydarzeniem',
      changePassword: 'Zmień Hasło',
      eventOverview: 'Przegląd Wydarzenia',
      eventTitle: 'Tytuł Wydarzenia',
      coupleNames: 'Imiona Pary',
      eventDate: 'Data Wydarzenia',
      venue: 'Miejsce',
      copyLink: 'Skopiuj Link',
      downloadQR: 'Pobierz Kod QR',
      availableFeatures: 'Dostępne Funkcje',
      gallery: 'Galeria',
      rsvp: 'RSVP',
      enabled: 'Włączone',
      disabled: 'Wyłączone',
      required: 'wymagane',
      editWebsite: 'Edytuj Stronę',
      generalInfo: 'OGÓLNE INFORMACJE O WYDARZENIU',
      dayDetails: 'ZARZĄDZANIE SZCZEGÓŁAMI DNIA WYDARZENIA',
      galleryManagement: 'ZARZĄDZANIE GALERIĄ',
      rsvpManagement: 'ZARZĄDZANIE RSVP',
      eventSettings: 'USTAWIENIA WYDARZENIA',
      manageSubscription: 'ZARZĄDZAJ SUBSKRYPCJĄ',
      billingHistory: 'HISTORIA PŁATNOŚCI',
      eventManagement: 'ZARZĄDZANIE WYDARZENIEM',
      dashboard: 'PANEL',
      copyLinkAndInvite: 'Skopiuj link i zaproś gości na stronę szczegółów wydarzenia',
      downloadQRAndShare: 'Pobierz kod QR i udostępnij główną stronę wydarzenia swoim gościom:',
      eventDetailsPage: 'stronę szczegółów wydarzenia',
      eventMainPage: 'główną stronę wydarzenia',
      withGuests: 'ze swoimi gośćmi',
      // Additional common keys
      title: 'Panel',
      createEvent: 'Utwórz Wydarzenie',
      editEvent: 'Edytuj Wydarzenie',
      deleteEvent: 'Usuń Wydarzenie',
      eventName: 'Nazwa Wydarzenia',
      eventStatus: 'Status Wydarzenia',
      actions: 'Akcje',
      save: 'Zapisz',
      cancel: 'Anuluj',
      delete: 'Usuń',
      confirm: 'Potwierdź',
      loading: 'Ładowanie...',
      error: 'Błąd',
      success: 'Sukces',
      noEvents: 'Brak wydarzeń',
      createNewEvent: 'Utwórz Nowe Wydarzenie',
      eventDetails: 'Szczegóły Wydarzenia',
      settings: 'Ustawienia',
      preview: 'Podgląd',
      publish: 'Opublikuj',
      unpublish: 'Cofnij Publikację',
      share: 'Udostępnij',
      guests: 'Goście',
      responses: 'Odpowiedzi',
      confirmed: 'Potwierdzone',
      declined: 'Odrzucone',
    },
    status: {
      loading: 'Ładowanie...',
      error: 'Błąd',
      success: 'Sukces',
      warning: 'Ostrzeżenie',
      info: 'Informacja',
      noData: 'Brak danych',
      notFound: 'Nie znaleziono',
      unauthorized: 'Brak autoryzacji',
      forbidden: 'Brak dostępu',
      serverError: 'Błąd serwera',
      networkError: 'Błąd sieci',
      tryAgain: 'Spróbuj ponownie',
      refresh: 'Odśwież',
      notAvailable: 'Niedostępne',
    },
    // Seating Chart Section
    seatingChart: {
      title: 'Plan Stołów',
      description: 'Znajdź swoje miejsce na przyjęciu.',
      welcome: 'Witamy',
      table: 'Stół',
    },
  },
};
``