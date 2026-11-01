import { FullEventPlan } from '../types/event';

export const SAMPLE_WEDDING: FullEventPlan = {
  details: {
    id: 'sample-wedding-1',
    title: 'Elena & Julian’s Napa Vineyard Celebration',
    eventType: 'wedding',
    date: '2027-06-19',
    startTime: '16:00',
    endTime: '23:30',
    location: 'St. Helena Vintners Estate, Napa Valley, CA',
    guestCount: 130,
    totalBudget: 42000,
    currency: 'USD',
    vibe: 'Sun-drenched Tuscan Elegance with Modern Minimalist Florals',
    themeDescription: 'Warm terracotta, olive branch greenery, champagne accents, and string lights overlooking rolling vineyard hills.',
    primaryPriorities: ['Exceptional Farm-to-Table Dining', 'Golden Hour Photography', 'Live Acoustic & Jazz Band'],
    dietaryRestrictions: ['Vegetarian Option Required', 'Gluten-Free Designated Desserts', '1 Severe Shellfish Allergy'],
    accessibilityNeeds: ['Golf cart shuttle from parking to vineyard terrace', 'Step-free ceremony seating'],
    notes: 'Sunset is around 20:25. Reception dinner starts at 19:15 to catch the sunset glow across the estate.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  budgetItems: [
    { id: 'b1', category: 'venue', name: 'Estate Rental & Lawn Ceremony Lawn', allocatedAmount: 14000, actualAmount: 14000, paidAmount: 7000, isPaid: false, notes: '50% deposit paid; balance due 30 days prior' },
    { id: 'b2', category: 'catering', name: 'Plated 3-Course Farm-to-Table & Local Wine Pairing', allocatedAmount: 12500, actualAmount: 12100, paidAmount: 4000, isPaid: false, notes: 'Includes estate sommeliers & bar service' },
    { id: 'b3', category: 'photography', name: 'Lead Photographer & 2nd Shooter + Drone Footage', allocatedAmount: 4500, actualAmount: 4200, paidAmount: 2000, isPaid: false, notes: '10 hours coverage + raw files & highlight gallery' },
    { id: 'b4', category: 'entertainment', name: 'String Quartet (Ceremony) & 6-Piece Brass Funk Band', allocatedAmount: 3800, actualAmount: 3600, paidAmount: 1500, isPaid: false, notes: 'Includes wireless sound system and cordless mics' },
    { id: 'b5', category: 'decor', name: 'Olive Foliage, Terracotta Urns, Edison Lighting', allocatedAmount: 3200, actualAmount: 3400, paidAmount: 3400, isPaid: true, notes: 'Includes custom wooden welcome sign & seating board' },
    { id: 'b6', category: 'stationery', name: 'Linen Letterpress Invites, Menus & Thank-You Cards', allocatedAmount: 1000, actualAmount: 850, paidAmount: 850, isPaid: true, notes: 'Eco-friendly handmade cotton rag paper' },
    { id: 'b7', category: 'transport', name: 'Guest Shuttle Coaches (Downtown Napa to Estate)', allocatedAmount: 1200, actualAmount: 1200, paidAmount: 600, isPaid: false, notes: 'Two 35-passenger executive shuttles' },
    { id: 'b8', category: 'contingency', name: 'Weather / Sundry Reserve', allocatedAmount: 1800, actualAmount: 350, paidAmount: 0, isPaid: false, notes: 'Reserved for emergency heaters or sudden rain tenting' },
  ],
  milestones: [
    { id: 'm1', title: 'Confirm Venue Contract & Pay Reservation Deposit', phase: '12_months_out', dueDate: '2026-06-19', completed: true, priority: 'high', assignedTo: 'Elena' },
    { id: 'm2', title: 'Book Photographer & Schedule Engagement Shoot', phase: '6_months_out', dueDate: '2026-12-19', completed: true, priority: 'high', assignedTo: 'Julian' },
    { id: 'm3', title: 'Conduct Tasting Session & Finalize Wine Pairings', phase: '3_months_out', dueDate: '2027-03-19', completed: true, priority: 'medium', assignedTo: 'Both' },
    { id: 'm4', title: 'Send Formal Invitations & Launch Online RSVP', phase: '3_months_out', dueDate: '2027-03-25', completed: false, priority: 'high', assignedTo: 'Elena' },
    { id: 'm5', title: 'Confirm Final Headcount with Caterer & Rentals', phase: '1_month_out', dueDate: '2027-05-19', completed: false, priority: 'high', assignedTo: 'Julian' },
    { id: 'm6', title: 'Finalize Day-Of Run of Show & Music Cue Sheet', phase: '2_weeks_out', dueDate: '2027-06-05', completed: false, priority: 'high', assignedTo: 'Coordinator' },
    { id: 'm7', title: 'Rehearsal Walkthrough & Welcome Drinks Dinner', phase: 'day_before', dueDate: '2027-06-18', completed: false, priority: 'high', assignedTo: 'Both' },
  ],
  dayOfSchedule: [
    { id: 's1', time: '11:00', endTime: '13:30', activity: 'Bridal Party Hair, Makeup & Champagne Mimosa Lounge', location: 'Estate Bridal Suite', keyPeople: ['Elena', 'Bridesmaids', 'Hair & Makeup Lead'] },
    { id: 's2', time: '13:30', endTime: '14:45', activity: 'First Look Photos & Couple Portraits in the Vineyards', location: 'Old Oak Grove', keyPeople: ['Elena', 'Julian', 'Photographer'] },
    { id: 's3', time: '15:30', endTime: '16:00', activity: 'Guest Shuttles Arrive; Pre-Ceremony Lavender Lemonade & Sparkling Wine', location: 'Veranda Fountain', keyPeople: ['Estate Ushers', 'String Quartet'] },
    { id: 's4', time: '16:00', endTime: '16:45', activity: 'Ceremony Exchange of Vows & Ring Ceremony', location: 'Panoramic Valley Terrace', keyPeople: ['Officiant', 'Elena', 'Julian', 'All Guests'] },
    { id: 's5', time: '16:45', endTime: '18:15', activity: 'Golden Hour Cocktail Reception with Passed Charcuterie & Wine', location: 'Arbor Courtyard', keyPeople: ['Guests', 'Catering Staff', 'Band Duo'] },
    { id: 's6', time: '18:30', endTime: '20:30', activity: 'Plated Dinner Service, Toasts & Sunset Dessert Unveiling', location: 'Glass Pavilion', keyPeople: ['Best Man', 'Maid of Honor', 'Parents', 'Caterer'] },
    { id: 's7', time: '20:30', endTime: '23:15', activity: 'Live Band Dance Party, Late-Night Woodfired Pizza Slices', location: 'Main Pavilion Hall', keyPeople: ['Live Band', 'All Guests'] },
    { id: 's8', time: '23:15', endTime: '23:30', activity: 'Sparkler Send-Off & Departure Shuttles Return to Town', location: 'Estate Front Gate', keyPeople: ['Coordinator', 'All Guests'] },
  ],
  vendors: [
    { id: 'v1', name: 'St. Helena Vintners Estate', category: 'Venue', contactPerson: 'Claire Dupont', email: 'events@sthelena-vintners.com', phone: '(707) 555-0144', status: 'contract_signed', estimatedCost: 14000, finalCost: 14000, depositPaid: 7000, notes: 'Requires approved vendor insurance certificates by May 1st' },
    { id: 'v2', name: 'Heirloom Napa Culinary Co.', category: 'Catering & Bar', contactPerson: 'Chef Marcus Lowe', email: 'marcus@heirloomnapa.com', phone: '(707) 555-0892', status: 'deposit_paid', estimatedCost: 12500, finalCost: 12100, depositPaid: 4000, notes: 'Includes staff, glassware, linens, and full bar setup' },
    { id: 'v3', name: 'Golden Hour Cinema & Photo', category: 'Photography & Video', contactPerson: 'Maya Sterling', email: 'maya@goldenhourcine.com', phone: '(415) 555-0199', status: 'deposit_paid', estimatedCost: 4500, finalCost: 4200, depositPaid: 2000, notes: 'Includes second shooter and 800+ edited high-res digital images' },
    { id: 'v4', name: 'Pacific Brass & Groove Band', category: 'Music & DJ', contactPerson: 'Derrick Vance', email: 'booking@pacificgroove.com', phone: '(510) 555-0371', status: 'contract_signed', estimatedCost: 3800, finalCost: 3600, depositPaid: 1500, notes: 'Requires 20-amp dedicated outlet on pavilion stage' },
    { id: 'v5', name: 'Wildflower & Twig Botanical Art', category: 'Flowers & Decor', contactPerson: 'Sienna Blake', email: 'sienna@wildflowertwig.com', phone: '(707) 555-0723', status: 'fully_paid', estimatedCost: 3200, finalCost: 3400, depositPaid: 3400, notes: 'Terracotta vessels sourced locally; compostable arrangement materials' },
  ],
  ideas: {
    themeName: 'Sun-Drenched Tuscan Estate',
    tagline: 'Timeless vineyard romance infused with effortless Mediterranean warmth.',
    palette: [
      { name: 'Terracotta Blush', hex: '#D97757', role: 'Primary Warmth' },
      { name: 'Tuscan Olive', hex: '#5E6B47', role: 'Foliage & Florals' },
      { name: 'Warm Champagne', hex: '#F3E8D2', role: 'Linens & Stationery' },
      { name: 'Charcoal Slate', hex: '#2C302E', role: 'Typography & Accents' },
      { name: 'Gilded Brass', hex: '#CBA135', role: 'Cutlery & Candleholders' },
    ],
    decorConcepts: [
      'Bare wooden harvest tables lined with trailing Italian ruscus, olive leaves, and tapered beeswax candles in amber glass holders.',
      'A bespoke cork escort board where each guest finds their table assignment etched onto personalized mini wooden wine stoppers.',
      'Canopy of warm warm-white festoon string lighting with suspended wrought iron chandeliers dripping in eucalyptus.',
      'Lounge vignette with vintage linen settees, brass side tables, and woven jute rugs overlooking the valley slopes.'
    ],
    menuSuggestions: {
      appetizers: [
        'Heirloom Tomato & Burrata Crostini with aged balsamic glaze and micro-basil',
        'Seared Duck Breast Skewers with mission fig chutney',
        'Crispy Truffled Polenta Bites topped with wild mushroom ragout'
      ],
      mains: [
        'Rosemary-Crusted Filet Mignon with reduction of Estate Cabernet and roasted garlic parsnip puree',
        'Pan-Seared Pacific Halibut over Meyer lemon herb risotto and grilled asparagus',
        'Handmade Butternut Squash Ravioli in brown butter sage emulsion with toasted pine nuts (Vegetarian)'
      ],
      desserts: [
        'Naked Olive Oil Citrus Cake with mascarpone frosting and fresh blackberries',
        'Petite Espresso Gelato Affogato bar served with house-baked almond biscotti'
      ],
      signatureDrinks: [
        { name: 'The Vineyard Sunset', description: 'Sparkling Rosé, elderflower liqueur, splash of grapefruit soda, garnished with fresh rosemary sprig', isAlcoholic: true },
        { name: 'Napa Meadow Cooler', description: 'Fresh lavender steeped syrup, pressed Meyer lemon, sparkling club soda, and bruised mint leaf', isAlcoholic: false }
      ]
    },
    invitationWording: {
      formal: 'Together with their families, Elena Sofia Morales and Julian Andrew Vance request the pleasure of your company as they exchange vows amidst the vineyards.',
      modernPlayful: 'Love, good wine, and our favorite people under the Napa sunset. Come celebrate our forever — Elena & Julian are getting married!',
      casual: 'Pack your dancing shoes and join us for vows, vineyard views, and plenty of wine! Elena and Julian are tying the knot on June 19th.'
    },
    activitiesAndEntertainment: [
      { title: 'Golden Hour Polaroid Guestbook', description: 'Guests snap vintage instant photos against a wine barrel floral arch and tape them with handwritten well-wishes.', timing: 'During cocktail hour (17:00 - 18:15)' },
      { title: 'Blind Wine Tasting Challenge', description: 'A fun self-serve station with 3 numbered estate carafes where guests guess the grape varietal for raffle tokens.', timing: 'Throughout dinner & reception' },
      { title: 'Late-Night S’mores & Fire Pit Hearth', description: 'Artisan marshmallows, gourmet dark chocolate squares, and graham crackers beside the stone patio fire bowl.', timing: '21:30 - 23:00' }
    ],
    musicPlaylistVibes: [
      { style: 'Acoustic Sunset Romance', sampleTracks: ['Leon Bridges - Beyond', 'Norah Jones - Come Away With Me', 'Ray LaMontagne - You Are The Best Thing'] },
      { style: 'Late Night High-Energy Funk & Soul', sampleTracks: ['Earth, Wind & Fire - September', 'Stevie Wonder - Signed, Sealed, Delivered', 'Dua Lipa - Levitating'] }
    ],
    costSavingHacks: [
      'Pouring estate sparkling wine rather than French Champagne saved $900 on the toast course without sacrificing taste.',
      'Re-purposing ceremony floral ground runners to decorate the head table during dinner saves $650 in duplicated floral orders.',
      'Digital RSVP via QR code on printed invite card halved postal stamp expenses and accelerated response tracking.'
    ]
  },
  chatHistory: [
    {
      id: 'c1',
      sender: 'assistant',
      content: 'Welcome! I have crafted your complete Napa Vineyard wedding roadmap. All budget numbers, day-of run of show, and vendors are pre-loaded. Ask me anything or tell me if you’d like to tweak your timeline or rebalance funds!',
      timestamp: new Date().toISOString()
    }
  ]
};

export const SAMPLE_BIRTHDAY: FullEventPlan = {
  details: {
    id: 'sample-birthday-1',
    title: 'Maya’s Neon Retro Arcade 30th Birthday Bash',
    eventType: 'birthday',
    date: '2026-11-20',
    startTime: '19:30',
    endTime: '01:00',
    location: 'CyberPixel Retro Arcade Lounge, Austin, TX',
    guestCount: 50,
    totalBudget: 4500,
    currency: 'USD',
    vibe: '80s Synthwave & Cyberpunk Glow Party with Nostalgic Gaming',
    themeDescription: 'Vibrant ultraviolet glow, neon cyan and magenta accents, Pac-Man tournament, custom retro cocktails, and upbeat synthwave beats.',
    primaryPriorities: ['Unlimited Retro Arcade Tokens', 'Custom Gourmet Slider Bar & Neon Cocktails', 'Epic Photo Ops with Neon Signs'],
    dietaryRestrictions: ['Vegetarian & Vegan Sliders', 'Dairy-Free Cupcakes'],
    accessibilityNeeds: ['Wheelchair accessible ramps across all gaming rooms'],
    notes: 'Surprise video montage playing on arcade projector at 21:00.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  budgetItems: [
    { id: 'b1', category: 'venue', name: 'Arcade Lounge Buyout & Unlimited Free-Play Tokens', allocatedAmount: 1800, actualAmount: 1750, paidAmount: 900, isPaid: false, notes: 'Includes exclusive mezzanine and 40 classic arcade cabinets' },
    { id: 'b2', category: 'catering', name: 'Gourmet Slider Trio, Loaded Tots & Neon Cocktails', allocatedAmount: 1400, actualAmount: 1450, paidAmount: 500, isPaid: false, notes: 'Custom cocktail taps + vegetarian jackfruit sliders' },
    { id: 'b3', category: 'entertainment', name: 'Synthwave DJ & Tournament Host', allocatedAmount: 500, actualAmount: 450, paidAmount: 200, isPaid: false, notes: '4 hours live DJ mix and tournament commentary' },
    { id: 'b4', category: 'decor', name: 'Custom Neon 30 LED Sign, UV Blacklights & Glow Merch', allocatedAmount: 400, actualAmount: 380, paidAmount: 380, isPaid: true, notes: 'Sign reads "Maya Level 30 Unlocked" which Maya gets to keep' },
    { id: 'b5', category: 'stationery', name: 'Pixel Art Holographic Invites & Custom Tokens', allocatedAmount: 150, actualAmount: 120, paidAmount: 120, isPaid: true, notes: 'Designed in 16-bit aesthetic with QR code RSVPs' },
    { id: 'b6', category: 'contingency', name: 'Buffer for Extra Drinks / Late-Night Tacos', allocatedAmount: 250, actualAmount: 0, paidAmount: 0, isPaid: false, notes: 'Standby emergency food truck run' },
  ],
  milestones: [
    { id: 'm1', title: 'Lock Down Arcade Lounge Booking & Mezzanine Hold', phase: '3_months_out', dueDate: '2026-08-20', completed: true, priority: 'high', assignedTo: 'Organizer' },
    { id: 'm2', title: 'Order Custom Neon LED Sign ("Level 30 Unlocked")', phase: '1_month_out', dueDate: '2026-10-20', completed: true, priority: 'medium', assignedTo: 'Bestie' },
    { id: 'm3', title: 'Finalize Slider Bar Headcount & Dietary Split', phase: '2_weeks_out', dueDate: '2026-11-06', completed: false, priority: 'high', assignedTo: 'Organizer' },
    { id: 'm4', title: 'Compile Childhood & 20s Photo/Video Reel', phase: '1_week_out', dueDate: '2026-11-13', completed: false, priority: 'medium', assignedTo: 'Friends Group' },
    { id: 'm5', title: 'Test AV Projector & Sound Check with DJ', phase: 'day_before', dueDate: '2026-11-19', completed: false, priority: 'high', assignedTo: 'DJ' },
  ],
  dayOfSchedule: [
    { id: 's1', time: '18:30', endTime: '19:15', activity: 'Decor Setup, UV Lighting Activation, Neon Sign Rigging', location: 'Mezzanine & Main Floor', keyPeople: ['Host', 'Arcade Manager'] },
    { id: 's2', time: '19:30', endTime: '20:15', activity: 'Guest Arrival, Welcome Neon Cocktails & Free-Play Warmup', location: 'Arcade Main Floor', keyPeople: ['All Guests', 'Bartender'] },
    { id: 's3', time: '20:15', endTime: '21:15', activity: 'Gourmet Slider Bar Open & Mario Kart / Street Fighter Tournament Round 1', location: 'Mezzanine Dining Area', keyPeople: ['All Guests', 'Tournament Host'] },
    { id: 's4', time: '21:15', endTime: '21:40', activity: 'Surprise "Level 30" Video Montage, Birthday Toast & Cake Cutting', location: 'Projector Lounge', keyPeople: ['Maya', 'All Friends'] },
    { id: 's5', time: '21:40', endTime: '23:30', activity: 'Tournament Championship Finals & High Score Trophy Ceremony', location: 'Center Arcade Stage', keyPeople: ['Finalists', 'DJ'] },
    { id: 's6', time: '23:30', endTime: '01:00', activity: 'Open Synthwave Dance Party & Late-Night Snack Bites', location: 'Main Dance Floor', keyPeople: ['DJ', 'All Guests'] },
  ],
  vendors: [
    { id: 'v1', name: 'CyberPixel Retro Lounge', category: 'Venue', contactPerson: 'Dave K.', email: 'dave@cyberpixelaustin.com', phone: '(512) 555-4081', status: 'deposit_paid', estimatedCost: 1800, finalCost: 1750, depositPaid: 900, notes: 'Includes 40 machines set to free-play mode' },
    { id: 'v2', name: 'Atomic Slider Kitchen', category: 'Catering & Bar', contactPerson: 'Samira Chen', email: 'sam@atomicsliders.com', phone: '(512) 555-8832', status: 'deposit_paid', estimatedCost: 1400, finalCost: 1450, depositPaid: 500, notes: 'Providing warming trays and allergen flags' },
    { id: 'v3', name: 'DJ TurboNeon', category: 'Music & DJ', contactPerson: 'Alex Rivera', email: 'turboneon@synthbeats.io', phone: '(512) 555-3390', status: 'deposit_paid', estimatedCost: 500, finalCost: 450, depositPaid: 200, notes: 'Bringing wireless tournament microphones and light synchronizers' },
  ],
  ideas: {
    themeName: 'Level 30: Cyber Retro Glow',
    tagline: 'Step into the neon grid where nostalgia meets the best party of the decade.',
    palette: [
      { name: 'Neon Magenta', hex: '#FF007F', role: 'Vibrant Accent' },
      { name: 'Electric Cyan', hex: '#00F0FF', role: 'High Voltage Glow' },
      { name: 'Laser Purple', hex: '#8B00FF', role: 'Ambient Lighting' },
      { name: 'Midnight Jet', hex: '#0A0A12', role: 'Deep Backdrop' },
      { name: 'Arcade Yellow', hex: '#FFE600', role: 'Token & Star Accents' },
    ],
    decorConcepts: [
      'Ultraviolet blacklights transforming white retro tees and glow wristbands into radiant highlights.',
      'Custom acrylic LED "Maya Level 30 Unlocked" neon centerpiece on the main cake table.',
      'Cascading pixel-art balloon arches made of metallic chrome and glow-in-the-dark orbs.',
      'Custom arcade token pouches stamped with the birthday logo handed to guests at entry.'
    ],
    menuSuggestions: {
      appetizers: [
        'Tetris Tots: Crispy tater tots tossed in garlic parmesan with queso and jalapeño dips',
        'Power-Up Mozzarella Sticks served with marinara and pesto syringes',
        'Rainbow Veggie Spring Rolls with sweet chili dip (Vegan)'
      ],
      mains: [
        'Smash Burger Sliders with secret comeback sauce and caramelized onions',
        'Hot Honey Crispy Chicken Sliders with pickled cabbage slaw',
        'Pulled Jackfruit BBQ Sliders with smoked vegan cheddar (Vegan)'
      ],
      desserts: [
        'Rubik’s Cube Birthday Cake with chocolate ganache and pop-rocks candy crunch',
        'Pac-Man Ghost Mini Cupcakes (Cherry, Blue Raspberry, Lemon)'
      ],
      signatureDrinks: [
        { name: 'The Cyber-Rita', description: 'Blanco tequila, blue curacao, lime juice, rimmed with electric popping pink salt', isAlcoholic: true },
        { name: 'Player 1 Lemonade', description: 'Butterfly pea flower tea layered over fresh lemonade with edible sparkle glitter', isAlcoholic: false }
      ]
    },
    invitationWording: {
      formal: 'Join us to honor Maya’s 30th Birthday at CyberPixel Lounge for an evening of games, sliders, and celebration.',
      modernPlayful: 'Press START to Join! Maya is leveling up to 30. Expect neon lights, high scores, and zero adulting.',
      casual: 'Maya is turning 30! Come play unlimited arcade games, grab a drink, and help us beat the final boss.'
    },
    activitiesAndEntertainment: [
      { title: 'Super Smash Bros & Mario Kart Grand Prix', description: 'Bracket-style tournament on the big screen with mini gold joystick trophies for winners.', timing: '20:15 - 21:30' },
      { title: '80s / 90s Pop Culture Trivia Flash Rounds', description: 'Quick 5-minute trivia bursts between games hosted by the DJ with drink tickets for top answers.', timing: 'Throughout the evening' },
      { title: 'Neon Glow Photo Booth', description: 'Selfie station with retro boombox props, pixel sunglasses, and instant sticker prints.', timing: 'All evening' }
    ],
    musicPlaylistVibes: [
      { style: '80s Retrowave & Synthpop', sampleTracks: ['The Midnight - Sunset', 'Kavinsky - Nightcall', 'New Order - Blue Monday'] },
      { style: 'Y2K Party Anthems', sampleTracks: ['Daft Punk - One More Time', 'Modjo - Lady', 'Justice - D.A.N.C.E.'] }
    ],
    costSavingHacks: [
      'Opting for a slider & tot bar instead of a formal sit-down meal reduced catering costs by 45%.',
      'The arcade buyout already included 40+ playable games, completely eliminating outside entertainment rental expenses.',
      'Using digital video invitations with interactive RSVP buttons avoided printing and shipping costs.'
    ]
  },
  chatHistory: [
    {
      id: 'c1',
      sender: 'assistant',
      content: 'Level 30 unlocked! The retro arcade celebration plan is ready. All budgets, tournament timings, and neon vibes are synced up. What would you like to modify?',
      timestamp: new Date().toISOString()
    }
  ]
};

export const SAMPLE_COMMUNITY: FullEventPlan = {
  details: {
    id: 'sample-community-1',
    title: 'Oakridge Neighborhood Autumn Harvest Festival',
    eventType: 'community',
    date: '2026-10-10',
    startTime: '11:00',
    endTime: '18:00',
    location: 'Oakridge Community Park & Amphitheater, Portland, OR',
    guestCount: 650,
    totalBudget: 12500,
    currency: 'USD',
    vibe: 'Warm, Inclusive, Family-Friendly Fall Carnival with Local Artisans',
    themeDescription: 'A vibrant community celebration of local agriculture, art, live bluegrass music, pumpkin carving, and eco-friendly practices.',
    primaryPriorities: ['Free Admission & High Family Accessibility', 'Local Farmer & Artisan Booths', 'Zero-Waste Environmental Standards'],
    dietaryRestrictions: ['Allergen Labeling on All Food Stalls', 'Vegetarian, Halal & Vegan Options'],
    accessibilityNeeds: ['ADA Paved Walkways', 'ASL Interpreter for Main Stage Announcements', 'Sensory De-escalation Quiet Tent'],
    notes: 'City park permit and temporary food vendor licenses approved by Portland Parks & Rec.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  budgetItems: [
    { id: 'b1', category: 'venue', name: 'Park Permit, Pavilions, Restroom Trailers & Clean-up Deposit', allocatedAmount: 2800, actualAmount: 2800, paidAmount: 2800, isPaid: true, notes: 'Includes electricity access and trash haulage' },
    { id: 'b2', category: 'entertainment', name: 'Amphitheater Bluegrass Bands, Magician & Kids Storyteller', allocatedAmount: 3200, actualAmount: 3000, paidAmount: 1500, isPaid: false, notes: '3 community bands + interactive family performers' },
    { id: 'b3', category: 'decor', name: 'Hay Bales, Cornstalks, Bunting Flags & Eco Signage', allocatedAmount: 1400, actualAmount: 1250, paidAmount: 1250, isPaid: true, notes: 'Locally grown hay returned to community garden for compost' },
    { id: 'b4', category: 'catering', name: 'Volunteer Meal Vouchers & Free Cider / Apple Tasting Station', allocatedAmount: 1800, actualAmount: 1600, paidAmount: 800, isPaid: false, notes: '300 gallons fresh local pressed cider + donuts' },
    { id: 'b5', category: 'other', name: 'First Aid Tent, Security Volunteers & Radio Comm Equipment', allocatedAmount: 900, actualAmount: 850, paidAmount: 850, isPaid: true, notes: 'Certified EMT on site for 8 hours' },
    { id: 'b6', category: 'stationery', name: 'Festival Program Maps, Banners & Park Lawn Signs', allocatedAmount: 600, actualAmount: 520, paidAmount: 520, isPaid: true, notes: 'Printed on recycled fiber boards' },
    { id: 'b7', category: 'contingency', name: 'Rain Shelter Canopy Reserves & Miscellaneous Supplies', allocatedAmount: 1800, actualAmount: 400, paidAmount: 0, isPaid: false, notes: 'Emergency canopy popups in case of Pacific NW drizzle' },
  ],
  milestones: [
    { id: 'm1', title: 'Submit Municipal Park & Sound Permits to City Council', phase: '6_months_out', dueDate: '2026-04-10', completed: true, priority: 'high', assignedTo: 'Committee Chair' },
    { id: 'm2', title: 'Launch Artisan & Food Truck Vendor Applications', phase: '3_months_out', dueDate: '2026-07-10', completed: true, priority: 'high', assignedTo: 'Vendor Lead' },
    { id: 'm3', title: 'Confirm Sound Engineer & Stage Schedule for Amphitheater', phase: '1_month_out', dueDate: '2026-09-10', completed: false, priority: 'medium', assignedTo: 'Music Coordinator' },
    { id: 'm4', title: 'Host Volunteer Orientation & Safety Protocol Briefing', phase: '1_week_out', dueDate: '2026-10-03', completed: false, priority: 'high', assignedTo: 'Volunteer Coordinator' },
    { id: 'm5', title: 'Set Up Main Stage, Pavilions & Waste Stations', phase: 'day_before', dueDate: '2026-10-09', completed: false, priority: 'high', assignedTo: 'Setup Crew' },
  ],
  dayOfSchedule: [
    { id: 's1', time: '08:00', endTime: '10:30', activity: 'Food Trucks & Artisan Booths Load-in; Sound Check', location: 'Park Perimeter & Stage', keyPeople: ['40 Vendors', 'Logistics Volunteers'] },
    { id: 's2', time: '11:00', endTime: '11:15', activity: 'Opening Bell Ceremony & Mayor Welcoming Remarks', location: 'Amphitheater Main Stage', keyPeople: ['Festival Director', 'Community Leaders'] },
    { id: 's3', time: '11:15', endTime: '13:00', activity: 'Pumpkin Painting Contest & Live Bluegrass Troupe', location: 'Kids Pavilion & Stage', keyPeople: ['Kids & Families', 'Cascade Bluegrass Trio'] },
    { id: 's4', time: '13:30', endTime: '14:30', activity: 'Annual Community Apple Pie Baking Championship', location: 'Tasting Tent', keyPeople: ['Local Bakers', 'Community Judges'] },
    { id: 's5', time: '15:00', endTime: '16:30', activity: 'Youth Talent Showcase & Folk Dance Ensemble', location: 'Amphitheater Stage', keyPeople: ['Local Youth Performers'] },
    { id: 's6', time: '17:00', endTime: '17:30', activity: 'Raffle Drawing for Community Green Space Fund', location: 'Main Information Booth', keyPeople: ['Committee', 'All Attendees'] },
    { id: 's7', time: '18:00', endTime: '20:00', activity: 'Festival Closes; Zero-Waste Tear-down and Litter Sweep', location: 'Full Park Grounds', keyPeople: ['Clean-up Volunteers', 'Parks Dept'] },
  ],
  vendors: [
    { id: 'v1', name: 'Portland Parks & Recreation', category: 'Permits & Security', contactPerson: 'Officer Linda Ramos', email: 'linda.ramos@portland.gov', phone: '(503) 555-0120', status: 'contract_signed', estimatedCost: 2800, finalCost: 2800, depositPaid: 2800, notes: 'Includes park maintenance, power drops and water access' },
    { id: 'v2', name: 'SoundCascade Audio Production', category: 'Rentals & Audio', contactPerson: 'Brett Cooper', email: 'brett@soundcascade.com', phone: '(503) 555-9011', status: 'deposit_paid', estimatedCost: 1900, finalCost: 1800, depositPaid: 900, notes: 'Outdoor weather-sealed PA system with 6 wireless microphones' },
    { id: 'v3', name: 'Hood River Orchard Growers', category: 'Catering & Bar', contactPerson: 'Mark Miller', email: 'mark@hoodrivercider.org', phone: '(541) 555-3829', status: 'deposit_paid', estimatedCost: 1800, finalCost: 1600, depositPaid: 800, notes: 'Providing 300 gallons sweet cider and cider doughnut fryers' },
  ],
  ideas: {
    themeName: 'Oakridge Harvest & Heritage',
    tagline: 'Celebrating our neighborhood roots with autumn warmth and sustainable community spirit.',
    palette: [
      { name: 'Rustic Pumpkin', hex: '#D35400', role: 'Warm Heritage Accent' },
      { name: 'Golden Wheat', hex: '#F39C12', role: 'Sunlit Meadow Tone' },
      { name: 'Forest Moss', hex: '#27AE60', role: 'Eco & Nature Green' },
      { name: 'Warm Cedarwood', hex: '#795548', role: 'Natural Timber Base' },
      { name: 'Autumn Cream', hex: '#FCF3CF', role: 'Soft Backdrop' },
    ],
    decorConcepts: [
      'Biodegradable burlap and marigold floral garlands draping information booths and picnic pavilions.',
      'Straw bale amphitheater seating arranged in sweeping semi-circles topped with hand-stitched patchwork quilts.',
      'Illustrated hand-painted wooden signposts indicating stages, ADA pathways, quiet zone, and compost stations.',
      'Cornhusk and pressed leaf luminarias illuminated with solar-powered LED tealights.'
    ],
    menuSuggestions: {
      appetizers: [
        'Warm Salted Soft Pretzels with local honey mustard',
        'Roasted Corn on the Cob with chipotle lime butter (or vegan herb butter)',
        'Spiced Butternut Squash Soup shooters with toasted pumpkin seeds'
      ],
      mains: [
        'Smoked Pulled Pork Sandwiches with crisp apple slaw',
        'Grilled Portobello & Bell Pepper Hoagies with vegan garlic aioli',
        'Locally Sourced Bratwurst & Sauerkraut with stone-ground mustard'
      ],
      desserts: [
        'Freshly Fried Hot Apple Cider Doughnuts with cinnamon sugar',
        'Spiced Pear Hand Pies with maple glaze'
      ],
      signatureDrinks: [
        { name: 'Hot Spiced Mulled Cider', description: 'Fresh pressed orchard cider simmered with cinnamon sticks, star anise, and orange peel', isAlcoholic: false },
        { name: 'Harvest Berry Sparkler', description: 'Crushed blackberries, sparkling water, thyme syrup, and a squeeze of fresh lemon', isAlcoholic: false }
      ]
    },
    invitationWording: {
      formal: 'The Oakridge Neighborhood Association warmly welcomes all residents and friends to the 2026 Annual Autumn Harvest Festival.',
      modernPlayful: 'Crisp air, hot cider, pumpkin painting, and incredible music! Bring the whole family to Oakridge Community Park on Oct 10th.',
      casual: 'Fall is here! Join your neighbors for good food, local crafts, and autumn festivities. Admission is free!'
    },
    activitiesAndEntertainment: [
      { title: 'Community Apple Pie Bake-Off', description: 'Neighborhood home bakers submit their best crusts and fillings judged by local culinary instructors.', timing: '13:30 - 14:30' },
      { title: 'Kid’s Giant Pumpkin Carving & Painting', description: 'Mini pumpkins and non-toxic paints provided free for all children under 12.', timing: '11:15 - 15:00' },
      { title: 'Zero-Waste Discovery Station', description: 'Fun interactive games teaching children and adults about municipal composting and recycling.', timing: 'All day' }
    ],
    musicPlaylistVibes: [
      { style: 'Acoustic Bluegrass & Folk Strings', sampleTracks: ['Béla Fleck & The Flecktones', 'Nickel Creek - The Lighthouse’s Tale', 'The Lumineers - Ho Hey'] },
      { style: 'Upbeat Pacific Northwest Americana', sampleTracks: ['Gregory Alan Isakov - San Luis', 'The Head and the Heart - Rivers and Roads', 'Lord Huron - Ends of the Earth'] }
    ],
    costSavingHacks: [
      'Partnered with local high school arts department to paint wooden event directional signage, saving $800 in commercial printing.',
      'Borrowing sound equipment from community center during off-peak hours saved $1,100 in commercial audio rental.',
      'Local farm donated 50 decorative hay bales in exchange for vendor sponsorship banner placement.'
    ]
  },
  chatHistory: [
    {
      id: 'c1',
      sender: 'assistant',
      content: 'The Oakridge Autumn Harvest Festival plan is fully prepared! The schedule emphasizes family accessibility, vendor flow, and zero-waste logistics. How can I assist you in refining it?',
      timestamp: new Date().toISOString()
    }
  ]
};

export const SAMPLE_EVENTS: FullEventPlan[] = [
  SAMPLE_WEDDING,
  SAMPLE_BIRTHDAY,
  SAMPLE_COMMUNITY,
];
