-- ==========================================
-- BotC Stats - Sample Seed Data
-- ==========================================
-- OPTIONAL: Paste this into Supabase SQL Editor AFTER running schema.sql
-- This gives you demo data to see the site in action.
-- Delete these games once you start logging your own.

INSERT INTO games (game_id, date, players, winning_team, game_mode, story_teller, modifiers) VALUES

-- Game 1: Trouble Brewing
(1, '2025-09-15', '[
  {"name":"Sarah_Lin","role":"Imp","roles":["Imp"],"team":"Evil","initial_team":"Evil"},
  {"name":"Tom_Nguyen","role":"Poisoner","roles":["Poisoner"],"team":"Evil","initial_team":"Evil"},
  {"name":"Mike_Chen","role":"Chef","roles":["Chef"],"team":"Good","initial_team":"Good"},
  {"name":"Priya_Patel","role":"Empath","roles":["Empath"],"team":"Good","initial_team":"Good"},
  {"name":"Jordan_Kim","role":"Washerwoman","roles":["Washerwoman"],"team":"Good","initial_team":"Good"},
  {"name":"Alex_Rivera","role":"Soldier","roles":["Soldier"],"team":"Good","initial_team":"Good"},
  {"name":"Dana_Park","role":"Drunk","roles":["Drunk"],"team":"Good","initial_team":"Good"}
]', 'Evil', 'Trouble Brewing', 'Casey_Moore', NULL),

-- Game 2: Trouble Brewing
(2, '2025-09-22', '[
  {"name":"Jordan_Kim","role":"Imp","roles":["Imp"],"team":"Evil","initial_team":"Evil"},
  {"name":"Alex_Rivera","role":"Scarlet_Woman","roles":["Scarlet_Woman"],"team":"Evil","initial_team":"Evil"},
  {"name":"Sarah_Lin","role":"Slayer","roles":["Slayer"],"team":"Good","initial_team":"Good"},
  {"name":"Tom_Nguyen","role":"Fortune_Teller","roles":["Fortune_Teller"],"team":"Good","initial_team":"Good"},
  {"name":"Mike_Chen","role":"Ravenkeeper","roles":["Ravenkeeper"],"team":"Good","initial_team":"Good"},
  {"name":"Dana_Park","role":"Virgin","roles":["Virgin"],"team":"Good","initial_team":"Good"},
  {"name":"Riley_Santos","role":"Butler","roles":["Butler"],"team":"Good","initial_team":"Good"}
]', 'Good', 'Trouble Brewing', 'Casey_Moore', NULL),

-- Game 3: Bad Moon Rising
(3, '2025-09-29', '[
  {"name":"Priya_Patel","role":"Zombuul","roles":["Zombuul"],"team":"Evil","initial_team":"Evil"},
  {"name":"Riley_Santos","role":"Godfather","roles":["Godfather"],"team":"Evil","initial_team":"Evil"},
  {"name":"Sarah_Lin","role":"Fool","roles":["Fool"],"team":"Good","initial_team":"Good"},
  {"name":"Tom_Nguyen","role":"Chambermaid","roles":["Chambermaid"],"team":"Good","initial_team":"Good"},
  {"name":"Jordan_Kim","role":"Innkeeper","roles":["Innkeeper"],"team":"Good","initial_team":"Good"},
  {"name":"Alex_Rivera","role":"Sailor","roles":["Sailor"],"team":"Good","initial_team":"Good"},
  {"name":"Mike_Chen","role":"Gambler","roles":["Gambler"],"team":"Good","initial_team":"Good"},
  {"name":"Dana_Park","role":"Tinker","roles":["Tinker"],"team":"Good","initial_team":"Good"}
]', 'Evil', 'Bad Moon Rising', 'Kai_Thompson', NULL),

-- Game 4: Sects & Violets
(4, '2025-10-06', '[
  {"name":"Tom_Nguyen","role":"Fang_Gu","roles":["Fang_Gu"],"team":"Evil","initial_team":"Evil"},
  {"name":"Dana_Park","role":"Witch","roles":["Witch"],"team":"Evil","initial_team":"Evil"},
  {"name":"Sarah_Lin","role":"Clockmaker","roles":["Clockmaker"],"team":"Good","initial_team":"Good"},
  {"name":"Mike_Chen","role":"Dreamer","roles":["Dreamer"],"team":"Good","initial_team":"Good"},
  {"name":"Priya_Patel","role":"Flowergirl","roles":["Flowergirl"],"team":"Good","initial_team":"Good"},
  {"name":"Jordan_Kim","role":"Artist","roles":["Artist"],"team":"Good","initial_team":"Good"},
  {"name":"Alex_Rivera","role":"Sage","roles":["Sage"],"team":"Good","initial_team":"Good"},
  {"name":"Riley_Santos","role":"Sweetheart","roles":["Sweetheart"],"team":"Good","initial_team":"Good"},
  {"name":"Noa_Garcia","role":"Juggler","roles":["Juggler"],"team":"Good","initial_team":"Good"}
]', 'Good', 'Sects & Violets', 'Casey_Moore', NULL),

-- Game 5: Trouble Brewing
(5, '2025-10-13', '[
  {"name":"Mike_Chen","role":"Imp","roles":["Imp"],"team":"Evil","initial_team":"Evil"},
  {"name":"Noa_Garcia","role":"Baron","roles":["Baron"],"team":"Evil","initial_team":"Evil"},
  {"name":"Tom_Nguyen","role":"Chef","roles":["Chef"],"team":"Good","initial_team":"Good"},
  {"name":"Sarah_Lin","role":"Investigator","roles":["Investigator"],"team":"Good","initial_team":"Good"},
  {"name":"Priya_Patel","role":"Monk","roles":["Monk"],"team":"Good","initial_team":"Good"},
  {"name":"Jordan_Kim","role":"Empath","roles":["Empath"],"team":"Good","initial_team":"Good"},
  {"name":"Dana_Park","role":"Recluse","roles":["Recluse"],"team":"Good","initial_team":"Good"},
  {"name":"Riley_Santos","role":"Mayor","roles":["Mayor"],"team":"Good","initial_team":"Good"},
  {"name":"Ava_Brooks","role":"Saint","roles":["Saint"],"team":"Good","initial_team":"Good"}
]', 'Evil', 'Trouble Brewing', 'Kai_Thompson', NULL),

-- Game 6: Sects & Violets
(6, '2025-10-20', '[
  {"name":"Alex_Rivera","role":"Vortox","roles":["Vortox"],"team":"Evil","initial_team":"Evil"},
  {"name":"Sarah_Lin","role":"Cerenovus","roles":["Cerenovus"],"team":"Evil","initial_team":"Evil"},
  {"name":"Tom_Nguyen","role":"Oracle","roles":["Oracle"],"team":"Good","initial_team":"Good"},
  {"name":"Mike_Chen","role":"Savant","roles":["Savant"],"team":"Good","initial_team":"Good"},
  {"name":"Priya_Patel","role":"Town_Crier","roles":["Town_Crier"],"team":"Good","initial_team":"Good"},
  {"name":"Jordan_Kim","role":"Seamstress","roles":["Seamstress"],"team":"Good","initial_team":"Good"},
  {"name":"Dana_Park","role":"Philosopher","roles":["Philosopher"],"team":"Good","initial_team":"Good"},
  {"name":"Noa_Garcia","role":"Klutz","roles":["Klutz"],"team":"Good","initial_team":"Good"}
]', 'Evil', 'Sects & Violets', 'Casey_Moore', NULL),

-- Game 7: Trouble Brewing
(7, '2025-10-27', '[
  {"name":"Dana_Park","role":"Imp","roles":["Imp"],"team":"Evil","initial_team":"Evil"},
  {"name":"Tom_Nguyen","role":"Spy","roles":["Spy"],"team":"Evil","initial_team":"Evil"},
  {"name":"Sarah_Lin","role":"Librarian","roles":["Librarian"],"team":"Good","initial_team":"Good"},
  {"name":"Mike_Chen","role":"Undertaker","roles":["Undertaker"],"team":"Good","initial_team":"Good"},
  {"name":"Priya_Patel","role":"Soldier","roles":["Soldier"],"team":"Good","initial_team":"Good"},
  {"name":"Alex_Rivera","role":"Ravenkeeper","roles":["Ravenkeeper"],"team":"Good","initial_team":"Good"},
  {"name":"Riley_Santos","role":"Slayer","roles":["Slayer"],"team":"Good","initial_team":"Good"}
]', 'Good', 'Trouble Brewing', 'Kai_Thompson', NULL),

-- Game 8: Bad Moon Rising
(8, '2025-11-03', '[
  {"name":"Sarah_Lin","role":"Po","roles":["Po"],"team":"Evil","initial_team":"Evil"},
  {"name":"Mike_Chen","role":"Assassin","roles":["Assassin"],"team":"Evil","initial_team":"Evil"},
  {"name":"Tom_Nguyen","role":"Exorcist","roles":["Exorcist"],"team":"Good","initial_team":"Good"},
  {"name":"Priya_Patel","role":"Courtier","roles":["Courtier"],"team":"Good","initial_team":"Good"},
  {"name":"Jordan_Kim","role":"Grandmother","roles":["Grandmother"],"team":"Good","initial_team":"Good"},
  {"name":"Alex_Rivera","role":"Fool","roles":["Fool"],"team":"Good","initial_team":"Good"},
  {"name":"Dana_Park","role":"Sailor","roles":["Sailor"],"team":"Good","initial_team":"Good"},
  {"name":"Noa_Garcia","role":"Moonchild","roles":["Moonchild"],"team":"Good","initial_team":"Good"},
  {"name":"Ava_Brooks","role":"Gambler","roles":["Gambler"],"team":"Good","initial_team":"Good"}
]', 'Good', 'Bad Moon Rising', 'Casey_Moore', NULL),

-- Game 9: Trouble Brewing
(9, '2025-11-10', '[
  {"name":"Riley_Santos","role":"Imp","roles":["Imp"],"team":"Evil","initial_team":"Evil"},
  {"name":"Jordan_Kim","role":"Poisoner","roles":["Poisoner"],"team":"Evil","initial_team":"Evil"},
  {"name":"Sarah_Lin","role":"Fortune_Teller","roles":["Fortune_Teller"],"team":"Good","initial_team":"Good"},
  {"name":"Tom_Nguyen","role":"Empath","roles":["Empath"],"team":"Good","initial_team":"Good"},
  {"name":"Mike_Chen","role":"Virgin","roles":["Virgin"],"team":"Good","initial_team":"Good"},
  {"name":"Priya_Patel","role":"Washerwoman","roles":["Washerwoman"],"team":"Good","initial_team":"Good"},
  {"name":"Alex_Rivera","role":"Chef","roles":["Chef"],"team":"Good","initial_team":"Good"},
  {"name":"Noa_Garcia","role":"Drunk","roles":["Drunk"],"team":"Good","initial_team":"Good"}
]', 'Evil', 'Trouble Brewing', 'Kai_Thompson', NULL),

-- Game 10: Sects & Violets
(10, '2025-11-17', '[
  {"name":"Noa_Garcia","role":"No_Dashii","roles":["No_Dashii"],"team":"Evil","initial_team":"Evil"},
  {"name":"Priya_Patel","role":"Evil_Twin","roles":["Evil_Twin"],"team":"Evil","initial_team":"Evil"},
  {"name":"Sarah_Lin","role":"Juggler","roles":["Juggler"],"team":"Good","initial_team":"Good"},
  {"name":"Tom_Nguyen","role":"Clockmaker","roles":["Clockmaker"],"team":"Good","initial_team":"Good"},
  {"name":"Mike_Chen","role":"Artist","roles":["Artist"],"team":"Good","initial_team":"Good"},
  {"name":"Jordan_Kim","role":"Flowergirl","roles":["Flowergirl"],"team":"Good","initial_team":"Good"},
  {"name":"Alex_Rivera","role":"Dreamer","roles":["Dreamer"],"team":"Good","initial_team":"Good"},
  {"name":"Dana_Park","role":"Snake_Charmer","roles":["Snake_Charmer"],"team":"Good","initial_team":"Good"},
  {"name":"Ava_Brooks","role":"Barber","roles":["Barber"],"team":"Good","initial_team":"Good"},
  {"name":"Leo_Wright","role":"Sage","roles":["Sage"],"team":"Good","initial_team":"Good"}
]', 'Good', 'Sects & Violets', 'Casey_Moore', NULL),

-- Game 11: Trouble Brewing
(11, '2025-11-24', '[
  {"name":"Alex_Rivera","role":"Imp","roles":["Imp"],"team":"Evil","initial_team":"Evil"},
  {"name":"Ava_Brooks","role":"Scarlet_Woman","roles":["Scarlet_Woman"],"team":"Evil","initial_team":"Evil"},
  {"name":"Sarah_Lin","role":"Monk","roles":["Monk"],"team":"Good","initial_team":"Good"},
  {"name":"Tom_Nguyen","role":"Slayer","roles":["Slayer"],"team":"Good","initial_team":"Good"},
  {"name":"Mike_Chen","role":"Librarian","roles":["Librarian"],"team":"Good","initial_team":"Good"},
  {"name":"Priya_Patel","role":"Chef","roles":["Chef"],"team":"Good","initial_team":"Good"},
  {"name":"Jordan_Kim","role":"Butler","roles":["Butler"],"team":"Good","initial_team":"Good"}
]', 'Good', 'Trouble Brewing', 'Casey_Moore', NULL),

-- Game 12: Bad Moon Rising
(12, '2025-12-01', '[
  {"name":"Jordan_Kim","role":"Shabaloth","roles":["Shabaloth"],"team":"Evil","initial_team":"Evil"},
  {"name":"Dana_Park","role":"Mastermind","roles":["Mastermind"],"team":"Evil","initial_team":"Evil"},
  {"name":"Sarah_Lin","role":"Sailor","roles":["Sailor"],"team":"Good","initial_team":"Good"},
  {"name":"Tom_Nguyen","role":"Innkeeper","roles":["Innkeeper"],"team":"Good","initial_team":"Good"},
  {"name":"Mike_Chen","role":"Chambermaid","roles":["Chambermaid"],"team":"Good","initial_team":"Good"},
  {"name":"Alex_Rivera","role":"Gambler","roles":["Gambler"],"team":"Good","initial_team":"Good"},
  {"name":"Riley_Santos","role":"Fool","roles":["Fool"],"team":"Good","initial_team":"Good"},
  {"name":"Noa_Garcia","role":"Goon","roles":["Goon"],"team":"Good","initial_team":"Good"}
]', 'Evil', 'Bad Moon Rising', 'Kai_Thompson', NULL),

-- Game 13: Trouble Brewing
(13, '2025-12-08', '[
  {"name":"Sarah_Lin","role":"Imp","roles":["Imp"],"team":"Evil","initial_team":"Evil"},
  {"name":"Riley_Santos","role":"Baron","roles":["Baron"],"team":"Evil","initial_team":"Evil"},
  {"name":"Tom_Nguyen","role":"Ravenkeeper","roles":["Ravenkeeper"],"team":"Good","initial_team":"Good"},
  {"name":"Mike_Chen","role":"Empath","roles":["Empath"],"team":"Good","initial_team":"Good"},
  {"name":"Priya_Patel","role":"Investigator","roles":["Investigator"],"team":"Good","initial_team":"Good"},
  {"name":"Jordan_Kim","role":"Soldier","roles":["Soldier"],"team":"Good","initial_team":"Good"},
  {"name":"Dana_Park","role":"Chef","roles":["Chef"],"team":"Good","initial_team":"Good"},
  {"name":"Noa_Garcia","role":"Recluse","roles":["Recluse"],"team":"Good","initial_team":"Good"},
  {"name":"Leo_Wright","role":"Saint","roles":["Saint"],"team":"Good","initial_team":"Good"}
]', 'Evil', 'Trouble Brewing', 'Casey_Moore', NULL),

-- Game 14: Sects & Violets (with Fabled)
(14, '2025-12-15', '[
  {"name":"Tom_Nguyen","role":"Vigormortis","roles":["Vigormortis"],"team":"Evil","initial_team":"Evil"},
  {"name":"Noa_Garcia","role":"Witch","roles":["Witch"],"team":"Evil","initial_team":"Evil"},
  {"name":"Sarah_Lin","role":"Oracle","roles":["Oracle"],"team":"Good","initial_team":"Good"},
  {"name":"Mike_Chen","role":"Town_Crier","roles":["Town_Crier"],"team":"Good","initial_team":"Good"},
  {"name":"Priya_Patel","role":"Juggler","roles":["Juggler"],"team":"Good","initial_team":"Good"},
  {"name":"Jordan_Kim","role":"Philosopher","roles":["Philosopher"],"team":"Good","initial_team":"Good"},
  {"name":"Alex_Rivera","role":"Artist","roles":["Artist"],"team":"Good","initial_team":"Good"},
  {"name":"Dana_Park","role":"Sweetheart","roles":["Sweetheart"],"team":"Good","initial_team":"Good"},
  {"name":"Ava_Brooks","role":"Seamstress","roles":["Seamstress"],"team":"Good","initial_team":"Good"}
]', 'Good', 'Sects & Violets', 'Kai_Thompson', '{"fabled":["Djinn"],"lorics":[]}'),

-- Game 15: Trouble Brewing
(15, '2025-12-22', '[
  {"name":"Priya_Patel","role":"Imp","roles":["Imp"],"team":"Evil","initial_team":"Evil"},
  {"name":"Leo_Wright","role":"Poisoner","roles":["Poisoner"],"team":"Evil","initial_team":"Evil"},
  {"name":"Sarah_Lin","role":"Undertaker","roles":["Undertaker"],"team":"Good","initial_team":"Good"},
  {"name":"Tom_Nguyen","role":"Fortune_Teller","roles":["Fortune_Teller"],"team":"Good","initial_team":"Good"},
  {"name":"Mike_Chen","role":"Mayor","roles":["Mayor"],"team":"Good","initial_team":"Good"},
  {"name":"Jordan_Kim","role":"Washerwoman","roles":["Washerwoman"],"team":"Good","initial_team":"Good"},
  {"name":"Alex_Rivera","role":"Virgin","roles":["Virgin"],"team":"Good","initial_team":"Good"},
  {"name":"Riley_Santos","role":"Drunk","roles":["Drunk"],"team":"Good","initial_team":"Good"}
]', 'Good', 'Trouble Brewing', 'Casey_Moore', NULL),

-- Game 16: Bad Moon Rising
(16, '2026-01-05', '[
  {"name":"Mike_Chen","role":"Pukka","roles":["Pukka"],"team":"Evil","initial_team":"Evil"},
  {"name":"Sarah_Lin","role":"Fearmonger","roles":["Fearmonger"],"team":"Evil","initial_team":"Evil"},
  {"name":"Tom_Nguyen","role":"Sailor","roles":["Sailor"],"team":"Good","initial_team":"Good"},
  {"name":"Priya_Patel","role":"Exorcist","roles":["Exorcist"],"team":"Good","initial_team":"Good"},
  {"name":"Jordan_Kim","role":"Courtier","roles":["Courtier"],"team":"Good","initial_team":"Good"},
  {"name":"Alex_Rivera","role":"Fool","roles":["Fool"],"team":"Good","initial_team":"Good"},
  {"name":"Dana_Park","role":"Grandmother","roles":["Grandmother"],"team":"Good","initial_team":"Good"},
  {"name":"Noa_Garcia","role":"Tinker","roles":["Tinker"],"team":"Good","initial_team":"Good"}
]', 'Evil', 'Bad Moon Rising', 'Kai_Thompson', NULL),

-- Game 17: Trouble Brewing (with team change)
(17, '2026-01-12', '[
  {"name":"Dana_Park","role":"Imp","roles":["Imp"],"team":"Evil","initial_team":"Evil"},
  {"name":"Ava_Brooks","role":"Spy","roles":["Spy"],"team":"Evil","initial_team":"Evil"},
  {"name":"Sarah_Lin","role":"Chef","roles":["Chef"],"team":"Good","initial_team":"Good"},
  {"name":"Tom_Nguyen","role":"Monk","roles":["Monk"],"team":"Good","initial_team":"Good"},
  {"name":"Mike_Chen","role":"Empath","roles":["Empath"],"team":"Good","initial_team":"Good"},
  {"name":"Priya_Patel","role":"Slayer","roles":["Slayer"],"team":"Good","initial_team":"Good"},
  {"name":"Jordan_Kim","role":"Librarian","roles":["Librarian"],"team":"Good","initial_team":"Good"},
  {"name":"Riley_Santos","role":"Ravenkeeper","roles":["Ravenkeeper"],"team":"Good","initial_team":"Good"}
]', 'Evil', 'Trouble Brewing', 'Casey_Moore', NULL),

-- Game 18: Sects & Violets
(18, '2026-01-19', '[
  {"name":"Riley_Santos","role":"Fang_Gu","roles":["Fang_Gu"],"team":"Evil","initial_team":"Evil"},
  {"name":"Leo_Wright","role":"Cerenovus","roles":["Cerenovus"],"team":"Evil","initial_team":"Evil"},
  {"name":"Sarah_Lin","role":"Savant","roles":["Savant"],"team":"Good","initial_team":"Good"},
  {"name":"Tom_Nguyen","role":"Dreamer","roles":["Dreamer"],"team":"Good","initial_team":"Good"},
  {"name":"Mike_Chen","role":"Flowergirl","roles":["Flowergirl"],"team":"Good","initial_team":"Good"},
  {"name":"Priya_Patel","role":"Clockmaker","roles":["Clockmaker"],"team":"Good","initial_team":"Good"},
  {"name":"Jordan_Kim","role":"Snake_Charmer","roles":["Snake_Charmer"],"team":"Good","initial_team":"Good"},
  {"name":"Alex_Rivera","role":"Mutant","roles":["Mutant"],"team":"Good","initial_team":"Good"},
  {"name":"Dana_Park","role":"Juggler","roles":["Juggler"],"team":"Good","initial_team":"Good"}
]', 'Evil', 'Sects & Violets', 'Casey_Moore', NULL),

-- Game 19: Trouble Brewing
(19, '2026-01-26', '[
  {"name":"Tom_Nguyen","role":"Imp","roles":["Imp"],"team":"Evil","initial_team":"Evil"},
  {"name":"Priya_Patel","role":"Scarlet_Woman","roles":["Scarlet_Woman"],"team":"Evil","initial_team":"Evil"},
  {"name":"Sarah_Lin","role":"Soldier","roles":["Soldier"],"team":"Good","initial_team":"Good"},
  {"name":"Mike_Chen","role":"Chef","roles":["Chef"],"team":"Good","initial_team":"Good"},
  {"name":"Jordan_Kim","role":"Fortune_Teller","roles":["Fortune_Teller"],"team":"Good","initial_team":"Good"},
  {"name":"Alex_Rivera","role":"Undertaker","roles":["Undertaker"],"team":"Good","initial_team":"Good"},
  {"name":"Dana_Park","role":"Washerwoman","roles":["Washerwoman"],"team":"Good","initial_team":"Good"},
  {"name":"Noa_Garcia","role":"Butler","roles":["Butler"],"team":"Good","initial_team":"Good"}
]', 'Good', 'Trouble Brewing', 'Kai_Thompson', NULL),

-- Game 20: Bad Moon Rising (with Fabled)
(20, '2026-02-02', '[
  {"name":"Noa_Garcia","role":"Zombuul","roles":["Zombuul"],"team":"Evil","initial_team":"Evil"},
  {"name":"Alex_Rivera","role":"Assassin","roles":["Assassin"],"team":"Evil","initial_team":"Evil"},
  {"name":"Sarah_Lin","role":"Chambermaid","roles":["Chambermaid"],"team":"Good","initial_team":"Good"},
  {"name":"Tom_Nguyen","role":"Gambler","roles":["Gambler"],"team":"Good","initial_team":"Good"},
  {"name":"Mike_Chen","role":"Innkeeper","roles":["Innkeeper"],"team":"Good","initial_team":"Good"},
  {"name":"Priya_Patel","role":"Fool","roles":["Fool"],"team":"Good","initial_team":"Good"},
  {"name":"Jordan_Kim","role":"Sailor","roles":["Sailor"],"team":"Good","initial_team":"Good"},
  {"name":"Dana_Park","role":"Exorcist","roles":["Exorcist"],"team":"Good","initial_team":"Good"},
  {"name":"Ava_Brooks","role":"Moonchild","roles":["Moonchild"],"team":"Good","initial_team":"Good"}
]', 'Good', 'Bad Moon Rising', 'Casey_Moore', '{"fabled":["Angel"],"lorics":[]}'),

-- Game 21: Trouble Brewing
(21, '2026-02-09', '[
  {"name":"Jordan_Kim","role":"Imp","roles":["Imp"],"team":"Evil","initial_team":"Evil"},
  {"name":"Dana_Park","role":"Poisoner","roles":["Poisoner"],"team":"Evil","initial_team":"Evil"},
  {"name":"Sarah_Lin","role":"Ravenkeeper","roles":["Ravenkeeper"],"team":"Good","initial_team":"Good"},
  {"name":"Tom_Nguyen","role":"Investigator","roles":["Investigator"],"team":"Good","initial_team":"Good"},
  {"name":"Mike_Chen","role":"Slayer","roles":["Slayer"],"team":"Good","initial_team":"Good"},
  {"name":"Priya_Patel","role":"Empath","roles":["Empath"],"team":"Good","initial_team":"Good"},
  {"name":"Riley_Santos","role":"Monk","roles":["Monk"],"team":"Good","initial_team":"Good"},
  {"name":"Leo_Wright","role":"Drunk","roles":["Drunk"],"team":"Good","initial_team":"Good"}
]', 'Evil', 'Trouble Brewing', 'Kai_Thompson', NULL),

-- Game 22: Sects & Violets (with Loric)
(22, '2026-02-16', '[
  {"name":"Sarah_Lin","role":"Vortox","roles":["Vortox"],"team":"Evil","initial_team":"Evil"},
  {"name":"Ava_Brooks","role":"Evil_Twin","roles":["Evil_Twin"],"team":"Evil","initial_team":"Evil"},
  {"name":"Tom_Nguyen","role":"Town_Crier","roles":["Town_Crier"],"team":"Good","initial_team":"Good"},
  {"name":"Mike_Chen","role":"Oracle","roles":["Oracle"],"team":"Good","initial_team":"Good"},
  {"name":"Priya_Patel","role":"Sage","roles":["Sage"],"team":"Good","initial_team":"Good"},
  {"name":"Jordan_Kim","role":"Artist","roles":["Artist"],"team":"Good","initial_team":"Good"},
  {"name":"Alex_Rivera","role":"Philosopher","roles":["Philosopher"],"team":"Good","initial_team":"Good"},
  {"name":"Dana_Park","role":"Clockmaker","roles":["Clockmaker"],"team":"Good","initial_team":"Good"},
  {"name":"Noa_Garcia","role":"Barber","roles":["Barber"],"team":"Good","initial_team":"Good"}
]', 'Evil', 'Sects & Violets', 'Casey_Moore', '{"fabled":[],"lorics":["Bootlegger"]}'),

-- Game 23: Trouble Brewing
(23, '2026-02-23', '[
  {"name":"Noa_Garcia","role":"Imp","roles":["Imp"],"team":"Evil","initial_team":"Evil"},
  {"name":"Mike_Chen","role":"Baron","roles":["Baron"],"team":"Evil","initial_team":"Evil"},
  {"name":"Sarah_Lin","role":"Virgin","roles":["Virgin"],"team":"Good","initial_team":"Good"},
  {"name":"Tom_Nguyen","role":"Chef","roles":["Chef"],"team":"Good","initial_team":"Good"},
  {"name":"Priya_Patel","role":"Librarian","roles":["Librarian"],"team":"Good","initial_team":"Good"},
  {"name":"Jordan_Kim","role":"Mayor","roles":["Mayor"],"team":"Good","initial_team":"Good"},
  {"name":"Alex_Rivera","role":"Soldier","roles":["Soldier"],"team":"Good","initial_team":"Good"},
  {"name":"Riley_Santos","role":"Fortune_Teller","roles":["Fortune_Teller"],"team":"Good","initial_team":"Good"},
  {"name":"Ava_Brooks","role":"Recluse","roles":["Recluse"],"team":"Good","initial_team":"Good"},
  {"name":"Leo_Wright","role":"Saint","roles":["Saint"],"team":"Good","initial_team":"Good"}
]', 'Good', 'Trouble Brewing', 'Kai_Thompson', NULL),

-- Game 24: Bad Moon Rising
(24, '2026-03-02', '[
  {"name":"Alex_Rivera","role":"Po","roles":["Po"],"team":"Evil","initial_team":"Evil"},
  {"name":"Tom_Nguyen","role":"Godfather","roles":["Godfather"],"team":"Evil","initial_team":"Evil"},
  {"name":"Sarah_Lin","role":"Courtier","roles":["Courtier"],"team":"Good","initial_team":"Good"},
  {"name":"Mike_Chen","role":"Sailor","roles":["Sailor"],"team":"Good","initial_team":"Good"},
  {"name":"Priya_Patel","role":"Fool","roles":["Fool"],"team":"Good","initial_team":"Good"},
  {"name":"Jordan_Kim","role":"Exorcist","roles":["Exorcist"],"team":"Good","initial_team":"Good"},
  {"name":"Dana_Park","role":"Gambler","roles":["Gambler"],"team":"Good","initial_team":"Good"},
  {"name":"Noa_Garcia","role":"Grandmother","roles":["Grandmother"],"team":"Good","initial_team":"Good"}
]', 'Evil', 'Bad Moon Rising', 'Casey_Moore', NULL),

-- Game 25: Trouble Brewing (with Fabled + Loric)
(25, '2026-03-09', '[
  {"name":"Priya_Patel","role":"Imp","roles":["Imp"],"team":"Evil","initial_team":"Evil"},
  {"name":"Riley_Santos","role":"Spy","roles":["Spy"],"team":"Evil","initial_team":"Evil"},
  {"name":"Sarah_Lin","role":"Empath","roles":["Empath"],"team":"Good","initial_team":"Good"},
  {"name":"Tom_Nguyen","role":"Slayer","roles":["Slayer"],"team":"Good","initial_team":"Good"},
  {"name":"Mike_Chen","role":"Washerwoman","roles":["Washerwoman"],"team":"Good","initial_team":"Good"},
  {"name":"Jordan_Kim","role":"Undertaker","roles":["Undertaker"],"team":"Good","initial_team":"Good"},
  {"name":"Alex_Rivera","role":"Monk","roles":["Monk"],"team":"Good","initial_team":"Good"},
  {"name":"Dana_Park","role":"Ravenkeeper","roles":["Ravenkeeper"],"team":"Good","initial_team":"Good"}
]', 'Good', 'Trouble Brewing', 'Kai_Thompson', '{"fabled":["Sentinel"],"lorics":["Storm_Catcher"]}');

-- Add scripts that appear in the seed data
INSERT INTO scripts (name, category) VALUES
    ('Bad Moon Rising', 'Normal')
ON CONFLICT (name) DO NOTHING;
