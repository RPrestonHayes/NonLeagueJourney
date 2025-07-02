// js/data/CountiesData.js

/**
 * Provides a structured dataset of UK counties/regions and associated towns/postcode prefixes.
 * This acts as a local database for generating geographically relevant game data.
 *
 * This version aims for highly granular postcode-to-region mapping,
 * with extensive lists of towns and villages for each.
 */

export const UK_COUNTIES_DATA = [
    // --- GREATER LONDON ---
    {
        county: 'Greater London (Central East)',
        postcodePrefixes: ['E1', 'EC1', 'EC2', 'EC3', 'EC4'],
        towns: [
            'City of London', 'Shoreditch', 'Spitalfields', 'Whitechapel', 'Aldgate', 'Clerkenwell',
            'Barbican', 'Moorgate', 'Liverpool Street', 'Bank', 'Monument', 'Tower Hill', 'Fenchurch Street',
            'Blackfriars', 'St Paul\'s', 'Aldersgate', 'Bishopsgate', 'Broadgate', 'Cannon Street',
            'Cheapside', 'Cornhill', 'Cripplegate', 'Farringdon', 'Fleet Street', 'Gracechurch Street',
            'Holborn', 'Leadenhall', 'Lombard Street', 'Ludgate Hill', 'Mansion House', 'Newgate',
            'Old Street', 'Queen Victoria Street', 'Snow Hill', 'Threadneedle Street', 'Walbrook',
            'Watling Street', 'Wood Street', 'Angel', 'Bunhill Fields', 'Finsbury', 'Hoxton',
            'Islington Green', 'Old Street Roundabout', 'Smithfield', 'The Barbican Centre'
        ]
    },
    {
        county: 'Greater London (East)',
        postcodePrefixes: ['E', 'E2', 'E3', 'E4', 'E5', 'E6', 'E7', 'E8', 'E9', 'E10', 'E11', 'E12', 'E13', 'E14', 'E15', 'E16', 'E17', 'E18', 'E20'],
        towns: [
            'Stratford', 'Bow', 'Bethnal Green', 'Hackney', 'Leyton', 'Leytonstone', 'Forest Gate',
            'East Ham', 'Plaistow', 'Canning Town', 'Beckton', 'Poplar', 'Isle of Dogs', 'Canary Wharf',
            'Walthamstow', 'Chingford', 'South Woodford', 'Wanstead', 'Clapton', 'Homerton', 'Mile End',
            'Stepney', 'Shadwell', 'Limehouse', 'Custom House', 'Victoria Dock', 'Upton Park', 'Manor Park',
            'Highams Park', 'Lower Clapton', 'Upper Clapton', 'Dalston', 'London Fields', 'Old Ford',
            'Three Mills', 'Aldersbrook', 'All Saints', 'Blackwall', 'Bromley-by-Bow', 'Canning Town',
            'Chingford Hatch', 'Clapton Park', 'Cranbrook', 'Cubitt Town', 'Custom House', 'Dalston',
            'Devons Road', 'East Village', 'Forest Gate', 'Gants Hill', 'Goodmayes', 'Hainault',
            'Hale End', 'Highams Park', 'Ilford', 'Kensington (East)', 'Leyton Marshes', 'Little Ilford',
            'Manor Park', 'Maryland', 'Monkhams', 'Newbury Park', 'Plaistow', 'Plaistow (West)',
            'Redbridge', 'Roding Valley', 'Shadwell', 'South Woodford', 'Stepney', 'Stratford Marsh',
            'Temple Mills', 'Upper Walthamstow', 'Upton', 'Walthamstow Village', 'Wanstead Park',
            'West Ham', 'Woodford Green'
        ]
    },
    {
        county: 'Greater London (North)',
        postcodePrefixes: ['N1', 'N2', 'N3', 'N4', 'N5', 'N6', 'N7', 'N8', 'N9', 'N10', 'N11', 'N12', 'N13', 'N14', 'N15', 'N16', 'N17', 'N19', 'N20', 'N21', 'N22'],
        towns: [
            'Islington', 'Finchley', 'Highgate', 'Holloway', 'Hornsey', 'Palmers Green', 'Southgate',
            'Tottenham', 'Wood Green', 'Archway', 'Barnsbury', 'Crouch End', 'East Finchley', 'Edmonton',
            'Finsbury Park', 'Fortis Green', 'Friern Barnet', 'Grange Park', 'Highbury', 'Muswell Hill',
            'New Southgate', 'North Finchley', 'Stroud Green', 'Tufnell Park', 'Upper Edmonton',
            'Upper Holloway', 'Whetstone', 'Winchmore Hill', 'Alexandra Palace', 'Angel', 'Arnos Grove',
            'Bounds Green', 'Canonbury', 'Clerkenwell', 'Crouch End', 'De Beauvoir Town', 'East Barnet',
            'East Finchley', 'Enfield', 'Finsbury', 'Fortis Green', 'Grange Park', 'Highbury', 'Highgate',
            'Hornsey', 'Islington', 'Lower Edmonton', 'Manor House', 'Muswell Hill', 'New Southgate',
            'North Finchley', 'Oakleigh Park', 'Palmers Green', 'Seven Sisters', 'Southgate', 'Stamford Hill',
            'Stoke Newington', 'Tufnell Park', 'Upper Edmonton', 'Upper Holloway', 'Whetstone',
            'White Hart Lane', 'Winchmore Hill', 'Wood Green'
        ]
    },
    {
        county: 'Greater London (North West)',
        postcodePrefixes: ['NW', 'NW1', 'NW2', 'NW3', 'NW4', 'NW5', 'NW6', 'NW7', 'NW8', 'NW9', 'NW10', 'NW11'],
        towns: [
            'Camden Town', 'Hampstead', 'Swiss Cottage', 'Hendon', 'Golders Green', 'Kilburn',
            'Mill Hill', 'St John\'s Wood', 'Wembley', 'Cricklewood', 'Dollis Hill', 'Edgware',
            'Frognal', 'Harlesden', 'Kensal Green', 'Kentish Town', 'Kingsbury', 'Neasden', 'Park Royal',
            'Queens Park', 'Somers Town', 'Stonebridge', 'West Hampstead', 'Willesden', 'Belsize Park',
            'Brondesbury', 'Childs Hill', 'Colindale', 'Dollis Hill', 'Fortune Green', 'Hampstead Garden Suburb',
            'Harlesden', 'Kensal Rise', 'Kilburn', 'Kingsbury', 'Maida Vale', 'Mill Hill East',
            'North Acton', 'North Wembley', 'Old Oak Common', 'Queensbury', 'Shepherd\'s Bush',
            'South Hampstead', 'Stonebridge Park', 'Sudbury', 'Swiss Cottage', 'The Hyde',
            'West Hendon', 'Willesden Green'
        ]
    },
    {
        county: 'Greater London (South East)',
        postcodePrefixes: ['SE', 'SE1', 'SE2', 'SE3', 'SE4', 'SE5', 'SE6', 'SE7', 'SE8', 'SE9', 'SE10', 'SE11', 'SE12', 'SE13', 'SE14', 'SE15', 'SE16', 'SE17', 'SE18', 'SE19', 'SE20', 'SE21', 'SE22', 'SE23', 'SE24', 'SE25', 'SE26', 'SE27', 'SE28'],
        towns: [
            'Southwark', 'Greenwich', 'Lewisham', 'Peckham', 'Bermondsey', 'Blackheath', 'Brockley',
            'Camberwell', 'Catford', 'Charlton', 'Deptford', 'Dulwich', 'Eltham', 'Forest Hill',
            'Herne Hill', 'Kennington', 'Lee', 'New Cross', 'Norwood', 'Rotherhithe', 'Sydenham',
            'Thamesmead', 'Woolwich', 'Abbey Wood', 'Anerley', 'Bellingham', 'Brixton',
            'Bromley', 'Crofton Park', 'Crystal Palace', 'East Dulwich', 'Elephant and Castle',
            'Gipsy Hill', 'Hither Green', 'Honor Oak', 'Kidbrooke', 'Ladywell', 'Lambeth', 'Mottingham',
            'Old Kent Road', 'Penge', 'Plumstead', 'Rye Lane', 'Shirley', 'South Norwood',
            'Tulse Hill', 'Upper Norwood', 'Walworth', 'West Dulwich', 'West Norwood',
            'Addington', 'Aldington', 'Anerley', 'Ashford', 'Balham', 'Beckenham', 'Bellingham',
            'Bermondsey', 'Blackfen', 'Blackheath', 'Brockley', 'Bromley', 'Camberwell',
            'Catford', 'Charlton', 'Chislehurst', 'Clapham', 'Crayford', 'Crofton Park',
            'Crystal Palace', 'Deptford', 'Dulwich Village', 'East Dulwich', 'Eltham',
            'Erith', 'Forest Hill', 'Gipsy Hill', 'Greenwich Peninsula', 'Grove Park',
            'Hither Green', 'Honor Oak Park', 'Kennington', 'Kidbrooke', 'Ladywell',
            'Lee Green', 'Lewisham', 'Longlands', 'Lower Sydenham', 'Mottingham', 'New Cross Gate',
            'Norwood', 'Nunhead', 'Penge', 'Plumstead', 'Rotherhithe', 'Rushey Green',
            'Shooter\'s Hill', 'Sidcup', 'South Bermondsey', 'South Norwood', 'Sydenham',
            'Thamesmead', 'Tulse Hill', 'Upper Norwood', 'Walworth', 'West Dulwich',
            'West Norwood', 'Woolwich Arsenal'
        ]
    },
    {
        county: 'Greater London (South West)',
        postcodePrefixes: ['SW', 'SW1', 'SW2', 'SW3', 'SW4', 'SW5', 'SW6', 'SW7', 'SW8', 'SW9', 'SW10', 'SW11', 'SW12', 'SW13', 'SW14', 'SW15', 'SW16', 'SW17', 'SW18', 'SW19', 'SW20'],
        towns: [
            'Westminster', 'Brixton', 'Chelsea', 'Clapham', 'Earls Court', 'Fulham', 'Kensington',
            'Pimlico', 'Putney', 'Streatham', 'Tooting', 'Wandsworth', 'Battersea', 'Balham',
            'Barnes', 'Brompton', 'Castelnau', 'Colliers Wood', 'East Sheen', 'Furzedown',
            'Knightsbridge', 'Larkhall', 'Merton', 'Mortlake', 'Nine Elms', 'Parsons Green',
            'Raynes Park', 'Roehampton', 'Southfields', 'Stockwell', 'Vauxhall', 'Wimbledon',
            'Belgravia', 'Brompton', 'Chelsea Harbour', 'Chiswick', 'Clapham Junction',
            'Earlsfield', 'East Putney', 'Fulham Broadway', 'Kensington Gore', 'Lavender Hill',
            'Morden', 'Norbury', 'Oval', 'Pimlico', 'Queen\'s Gate', 'Richmond', 'South Kensington',
            'South Wimbledon', 'St James\'s Park', 'Victoria', 'Walham Green', 'West Brompton',
            'Westminster Abbey', 'White City', 'Wimbledon Common', 'Wimbledon Park'
        ]
    },
    {
        county: 'Greater London (West)',
        postcodePrefixes: ['W', 'W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8', 'W9', 'W10', 'W11', 'W12', 'W13', 'W14'],
        towns: [
            'Westminster', 'Acton', 'Chiswick', 'Ealing', 'Hammersmith', 'Kensington', 'Maida Vale',
            'Notting Hill', 'Shepherd\'s Bush', 'Westbourne Park', 'Bayswater', 'Belgravia',
            'Bloomsbury', 'Bond Street', 'Camden', 'Carnaby Street', 'Covent Garden',
            'Fitzrovia', 'Holland Park', 'Kensal Town', 'Ladbroke Grove', 'Marylebone', 'Mayfair',
            'North Kensington', 'Paddington', 'Piccadilly', 'Regent Street', 'Soho', 'Southall',
            'West Ealing', 'West Kensington', 'White City', 'Bayswater', 'Charing Cross', 'Clapham Junction',
            'Dorset Square', 'East Acton', 'Ealing Broadway', 'Fulham', 'Greenford', 'Hanwell',
            'Holland Park', 'Hyde Park', 'Kensal Green', 'Kensington Gardens', 'Kensington High Street',
            'Ladbroke Grove', 'Lancaster Gate', 'Marble Arch', 'North Acton', 'North Kensington',
            'Notting Hill Gate', 'Oxford Street', 'Paddington Green', 'Park Royal', 'Queensway',
            'Royal Oak', 'Shepherd\'s Bush Green', 'South Acton', 'South Ealing', 'West Acton',
            'Westbourne Grove', 'White City', 'Wormwood Scrubs'
        ]
    },
    {
        county: 'Greater London (Outer North East)',
        postcodePrefixes: ['IG', 'RM'], // Ilford, Romford
        towns: [
            'Ilford', 'Romford', 'Barking', 'Dagenham', 'Hornchurch', 'Upminster', 'Rainham',
            'Chadwell Heath', 'Goodmayes', 'Newbury Park', 'Seven Kings', 'Gants Hill', 'Hainault',
            'Rush Green', 'Ardleigh Green', 'Collier Row', 'Emerson Park', 'Gidea Park', 'Harold Hill',
            'Harold Wood', 'Mawneys', 'Noak Hill', 'Wennington', 'Aldborough Hatch', 'Becontree',
            'Becontree Heath', 'Creekmouth', 'Eastbrook', 'Fair Cross', 'Little Heath', 'Marks Gate',
            'Maylands', 'Rush Green', 'Seven Kings', 'South Hornchurch', 'Stifford Clays',
            'Upney', 'Valence House', 'Warley', 'Wennington'
        ]
    },
    {
        county: 'Greater London (Outer North)',
        postcodePrefixes: ['EN', 'HA'], // Enfield, Harrow
        towns: [
            'Enfield', 'Harrow', 'Barnet', 'Edgware', 'Potters Bar', 'Winchmore Hill',
            'Cockfosters', 'Cuffley', 'East Barnet', 'Hadley Wood', 'Oakwood', 'South Mimms',
            'Waltham Cross', 'Bush Hill Park', 'Grange Park', 'Ponders End', 'Southgate',
            'Arnos Grove', 'Bounds Green', 'Finchley', 'Friern Barnet', 'New Southgate',
            'Wealdstone', 'Ruislip', 'Pinner', 'Stanmore', 'Northwood', 'Hatch End',
            'Kenton', 'Rayners Lane', 'South Harrow', 'West Harrow', 'Arkley', 'Barnet Gate',
            'Brunswick Park', 'Burnt Oak', 'Cannons Park', 'Colindale', 'East Finchley', 'Edgware',
            'Finchley Central', 'Finchley Church End', 'Finchley East', 'Finchley North',
            'Finchley West', 'Golders Green', 'Hampstead Garden Suburb', 'Hendon', 'High Barnet',
            'Holders Hill', 'Mill Hill', 'Mill Hill East', 'Monken Hadley', 'New Barnet',
            'North Finchley', 'Totteridge', 'Whetstone', 'Woodside Park'
        ]
    },
    {
        county: 'Greater London (Outer West)',
        postcodePrefixes: ['UB'], // Uxbridge, Hayes, Southall
        towns: [
            'Uxbridge', 'Hayes', 'Southall', 'Northolt', 'West Drayton', 'Greenford',
            'Perivale', 'Yeading', 'Cowley', 'Harmondsworth', 'Harlington', 'Hillingdon',
            'Ickenham', 'Longford', 'Sipson', 'West Ruislip', 'Boston Manor', 'Drayton Green',
            'Ealing Common', 'Eastcote', 'Greenford Green', 'Hanwell', 'Hayes End', 'Hayes Town',
            'North Greenford', 'North Hillingdon', 'Northwood Hills', 'Norwood Green', 'Osterley',
            'Ruislip Manor', 'South Ruislip', 'West Twyford', 'Wood End'
        ]
    },
    {
        county: 'Greater London (Outer South West)',
        postcodePrefixes: ['TW', 'KT'], // Twickenham, Kingston, Richmond
        towns: [
            'Twickenham', 'Kingston upon Thames', 'Richmond', 'Teddington', 'Feltham', 'Hounslow',
            'Isleworth', 'Ashford', 'Hampton', 'Hanworth', 'Sunbury-on-Thames',
            'Whitton', 'Ham', 'New Malden', 'Surbiton', 'Tolworth', 'Worcester Park', 'Chessington',
            'East Molesey', 'West Molesey', 'Berrylands', 'Coombe', 'Hook', 'Old Malden', 'Addlestone',
            'Byfleet', 'Chertsey', 'Claygate', 'Cobham', 'East Horsley', 'Egham', 'Esher', 'Farnham',
            'Fetcham', 'Great Bookham', 'Hampton Court', 'Hampton Hill', 'Hampton Wick', 'Hersham',
            'Long Ditton', 'Lower Feltham', 'Molesey', 'Osterley', 'Shepperton', 'Staines-upon-Thames',
            'Sunbury Common', 'Walton-on-Thames', 'West Byfleet', 'Weybridge', 'Woodham'
        ]
    },
    {
        county: 'Greater London (Outer South)',
        postcodePrefixes: ['CR', 'SM'], // Croydon, Sutton
        towns: [
            'Croydon', 'Sutton', 'Carshalton', 'Wallington', 'Mitcham', 'Purley',
            'Coulsdon', 'Norbury', 'South Norwood', 'Thornton Heath', 'Addiscombe',
            'Beddington', 'Bramley', 'Kenley', 'Sanderstead', 'Shirley', 'Upper Norwood',
            'Waddon', 'Whyteleafe', 'Cheam', 'Hackbridge', 'Rosehill', 'St Helier', 'Worcester Park',
            'Addington', 'Beddington Corner', 'Broad Green', 'Caterham', 'Forestdale', 'Hamsey Green',
            'Kenley', 'Monks Orchard', 'New Addington', 'Norbury', 'Pollards Hill', 'Roundshaw',
            'Selhurst', 'Shirley', 'South Croydon', 'South Wimbledon', 'Spring Park', 'Thornton Heath',
            'Upper Norwood', 'Waddon', 'West Croydon', 'Woodside'
        ]
    },
    {
        county: 'Greater London (Outer South East)',
        postcodePrefixes: ['BR', 'DA'], // Bromley, Dartford, Bexley, Sidcup, Erith
        towns: [
            'Bromley', 'Orpington', 'Beckenham', 'Chislehurst', 'Sidcup', 'Bexleyheath',
            'Welling', 'Erith', 'Swanley', 'West Wickham', 'Biggin Hill', 'Chelsfield',
            'Crayford', 'Dartford', 'Downham', 'Farnborough', 'Green Street Green',
            'Hayes', 'Keston', 'Mottingham', 'New Eltham', 'Petts Wood', 'St Mary Cray',
            'St Paul\'s Cray', 'Sundridge Park', 'Swanley', 'Thamesmead', 'Wilmington',
            'Ashford', 'Barnehurst', 'Belvedere', 'Bexley', 'Bexley Village', 'Blackfen',
            'Bostall Heath', 'Bostall Woods', 'Burnt Oak', 'Coldharbour', 'Crayford',
            'Croft', 'Crossness', 'Darenth', 'East Wickham', 'Elmstead', 'Falconwood',
            'Farningham', 'Foots Cray', 'Greenhithe', 'Hawley', 'Hextable', 'Horton Kirby',
            'Joydens Wood', 'Lessness Heath', 'Longfield', 'North Cray', 'North End',
            'Northumberland Heath', 'Ruxley', 'Slade Green', 'South Darenth', 'St Paul\'s Cray',
            'Sutton-at-Hone', 'Swanscombe', 'West Heath', 'Wilmington'
        ]
    },

    // --- EAST OF ENGLAND (Excluding London Overlaps) ---
    {
        county: 'Bedfordshire',
        postcodePrefixes: ['MK40', 'MK41', 'MK42', 'MK43', 'MK44', 'MK45', 'MK46', 'SG5', 'SG6', 'SG7', 'SG15', 'SG16', 'SG17', 'SG18', 'SG19', 'LU'],
        towns: [
            'Bedford', 'Luton', 'Dunstable', 'Leighton Buzzard', 'Biggleswade', 'Houghton Regis',
            'Flitwick', 'Ampthill', 'Arlesey', 'Potton', 'Sandy', 'Shefford', 'Toddington', 'Woburn',
            'Cranfield', 'Clophill', 'Harlington', 'Kempston', 'Marston Moretaine', 'Maulden', 'Old Warden',
            'Sharnbrook', 'Stevington', 'Wilstead', 'Wootton', 'Barton-le-Clay', 'Bromham', 'Cardington',
            'Caddington', 'Chalgrave', 'Eaton Bray', 'Elstow', 'Great Barford', 'Henlow', 'Hockliffe',
            'Kempston Hardwick', 'Langford', 'Lidlington', 'Meppershall', 'Millbrook', 'Oakley', 'Pulloxhill',
            'Riseley', 'Salford', 'Silsoe', 'Stondon', 'Sutton', 'Tempsford',
            'Thurleigh', 'Westoning', 'Woburn Sands', 'Aspley Guise', 'Biscot', 'Broom', 'Chicksands',
            'Cranfield', 'Caddington', 'Eaton Socon', 'Eggington', 'Elstow', 'Eversholt', 'Farley Hill',
            'Felmersham', 'Great Denham', 'Greenfield', 'Harrold', 'Hexton', 'Hockliffe', 'Husborne Crawley',
            'Ickwell', 'Keysoe', 'Knotting Green', 'Luton Hoo', 'Maulden', 'Meppershall', 'Millbrook',
            'Milton Bryan', 'Moggerhanger', 'Netherfield', 'Northill', 'Odell', 'Old Warden', 'Pavenham',
            'Potsgrove', 'Pulloxhill', 'Radwell', 'Ridgmont', 'Salford', 'Sharnbrook', 'Silsoe', 'Slip End',
            'Southill', 'Stagsden', 'Stotfold', 'Studham', 'Sundon', 'Thurleigh', 'Tilsworth', 'Upper Caldecote',
            'Warden', 'Westoning', 'Whipsnade', 'Wilden', 'Wilstead', 'Woburn', 'Wootton'
        ]
    },
    {
        county: 'Cambridgeshire',
        postcodePrefixes: ['CB', 'PE1', 'PE2', 'PE3', 'PE4', 'PE5', 'PE6', 'PE7', 'PE8', 'PE13', 'PE14', 'PE15', 'PE16', 'PE19', 'PE27', 'PE28', 'PE29'],
        towns: [
            'Cambridge', 'Peterborough', 'Ely', 'St Neots', 'Huntingdon', 'March',
            'Whittlesey', 'Soham', 'St Ives', 'Wisbech', 'Chatteris', 'Godmanchester',
            'Littleport', 'Sawston', 'Waterbeach', 'Cambourne', 'Histon', 'Longstanton',
            'Burwell', 'Cottenham', 'Gamlingay', 'Great Shelford', 'Haddenham', 'Melbourn',
            'Papworth Everard', 'Sutton', 'Swavesey', 'Willingham', 'Alconbury', 'Bar Hill',
            'Bourn', 'Brampton', 'Buckden', 'Caxton', 'Cherry Hinton', 'Comberton',
            'Conington', 'Duxford', 'Earith', 'Farcet', 'Fowlmere', 'Girton', 'Grantchester',
            'Great Cambourne', 'Great Gransden', 'Great Paxton', 'Haslingfield',
            'Hemingford Grey', 'Impington', 'Isleham', 'Kimbolton', 'Landbeach',
            'Manea', 'Over', 'Ramsey', 'Sawtry', 'Somersham', 'Stretham',
            'Thorney', 'Upwell', 'Warboys', 'Whittlesford', 'Wimblington', 'Yaxley',
            'Abbots Ripton', 'Arrington', 'Babraham', 'Balsham', 'Barrington', 'Bassingbourn',
            'Benwick', 'Bottisham', 'Boxworth', 'Bythorn', 'Caldecote', 'Carlton', 'Castor',
            'Chesterton', 'Chippenham', 'Coates', 'Colne', 'Conington', 'Coton', 'Croxton',
            'Diddington', 'Doddington', 'Downham', 'Dry Drayton', 'Dullingham', 'Duxford',
            'Eastrea', 'Elton', 'Eltisley', 'Eynesbury', 'Fen Drayton', 'Fenstanton',
            'Folksworth', 'Fordham', 'Fowlmere', 'Fulbourn', 'Grafham', 'Grantchester',
            'Great Abington', 'Great Gidding', 'Great Gransden', 'Great Wilbraham', 'Guilden Morden',
            'Guyhirn', 'Hardwick', 'Harlton', 'Harston', 'Hauxton', 'Heydon', 'Hilton',
            'Holme', 'Horningsea', 'Horseheath', 'Ickleton', 'Kirtling', 'Knapwell', 'Leverington',
            'Linton', 'Little Abington', 'Little Gidding', 'Little Gransden', 'Little Wilbraham',
            'Longstowe', 'Madingley', 'Melbourn', 'Meldreth', 'Newton', 'Oakington', 'Orton Longueville',
            'Orton Waterville', 'Over', 'Pampisford', 'Papworth St Agnes', 'Parson Drove', 'Peakirk',
            'Pidley', 'Pondersbridge', 'Ramsey St Marys', 'Reach', 'Shepreth', 'Shudy Camps',
            'Sutton Gault', 'Swaffham Bulbeck', 'Swaffham Prior', 'Thriplow', 'Tydd St Giles',
            'Upwood', 'Wansford', 'Whaddon', 'Whittlesey', 'Wicken', 'Wimblington', 'Witcham',
            'Witchford', 'Woodwalton', 'Yelling'
        ]
    },
    {
        county: 'Essex (Chelmsford & Mid)',
        postcodePrefixes: ['CM'],
        towns: [
            'Chelmsford', 'Braintree', 'Witham', 'Maldon', 'Billericay', 'Brentwood',
            'Burnham-on-Crouch', 'Chipping Ongar', 'Coggeshall', 'Danbury', 'Great Dunmow',
            'Halstead', 'Ingatestone', 'Kelvedon', 'Rettendon', 'Southminster', 'Stock', 'Tiptree', 'Writtle',
            'Black Notley', 'Bocking', 'Boreham', 'Broomfield', 'Hatfield Peverel', 'Heybridge',
            'Little Waltham', 'Margaretting', 'Pleasington', 'Silver End', 'Terling', 'Tollesbury',
            'White Notley', 'Wickham Bishops', 'Bradwell-on-Sea', 'Bures', 'Cold Norton',
            'Copford', 'Fairstead', 'Feering', 'Finchingfield', 'Fordham', 'Great Baddow',
            'Great Leighs', 'Great Totham', 'Hatfield Heath', 'High Easter', 'Layer Marney',
            'Little Baddow', 'Little Waltham', 'Matching Green', 'Mundon', 'Purleigh', 'Radwinter',
            'Roxwell', 'Sible Hedingham', 'Steeple Bumpstead', 'Takeley', 'Thaxted', 'Tolleshunt D\'Arcy',
            'Ugley', 'White Colne', 'Wickham St Paul', 'Aythorpe Roding', 'Bardfield Saling', 'Barnston',
            'Belchamp Otten', 'Blackmore', 'Bobbingworth', 'Bradwell', 'Broxted', 'Canfield',
            'Chignall St James', 'Chrishall', 'Clavering', 'Colne Engaine', 'Crabbs Cross', 'Debden',
            'Doddinghurst', 'East Hanningfield', 'Eight Ash Green', 'Faulkbourne', 'Finchingfield',
            'Fordham', 'Fyfield', 'Gosfield', 'Great Bardfield', 'Great Braxted', 'Great Easton',
            'Great Saling', 'Great Waltham', 'Greenstead Green', 'Hadstock', 'Hatfield Broad Oak',
            'High Laver', 'High Roding', 'Hockley', 'Howe Street', 'Hutton', 'Layer Breton',
            'Leaden Roding', 'Little Baddow', 'Little Braxted', 'Little Easton', 'Little Laver',
            'Little Maplestead', 'Little Waltham', 'Latchingdon', 'Leighs', 'Lindsell', 'Matching',
            'Messing', 'Mount Bures', 'Mountnessing', 'Navestock', 'Nazeing', 'Newport', 'North Fambridge',
            'Norton Mandeville', 'Ongar', 'Panfield', 'Pleshey', 'Potter Street', 'Rayne', 'Rivenhall',
            'Roding', 'Roxwell', 'Sandon', 'Shalford', 'Sheering', 'Shellow Bowells', 'Sible Hedingham',
            'Silver End', 'South Hanningfield', 'Stambourne', 'Stebbing', 'Steeple', 'Stisted',
            'Terling', 'Theydon Bois', 'Thornwood Common', 'Tilbury Juxta Clare', 'Toppesfield',
            'Ugley Green', 'Ulting', 'Waltham Abbey', 'White Colne', 'White Roding', 'Wickham St Paul',
            'Wivenhoe', 'Woodham Ferrers', 'Wormingford'
        ]
    },
    {
        county: 'Essex (Colchester & North)',
        postcodePrefixes: ['CO'],
        towns: [
            'Colchester', 'Clacton-on-Sea', 'Frinton-on-Sea', 'Walton-on-the-Naze', 'Harwich',
            'Manningtree', 'Brightlingsea', 'Earls Colne', 'Wivenhoe', 'Mersea Island',
            'Ardleigh', 'Dedham', 'Great Bentley', 'Great Tey', 'Layer de la Haye', 'Rowhedge',
            'St Osyth', 'Tiptree', 'West Bergholt', 'Alresford', 'Boxted', 'Bradfield',
            'Chappel', 'Copford', 'East Bergholt', 'Eight Ash Green', 'Fingringhoe', 'Fordham',
            'Great Horkesley', 'Langham', 'Layer Breton', 'Little Horkesley',
            'Marks Tey', 'Mistley', 'Peldon', 'Salcott', 'Tendring', 'Thorpe-le-Soken',
            'Tollesbury', 'West Mersea', 'Wrabness', 'Abberton', 'Aldham', 'Berechurch',
            'Birch', 'Blackheath', 'Bocking', 'Bradfield', 'Bradwell-on-Sea', 'Brightlingsea',
            'Burton\'s Green', 'Chappel', 'Coggeshall', 'Copford Green', 'Crouch', 'Dedham',
            'East Mersea', 'Eight Ash Green', 'Fingringhoe', 'Fordstreet', 'Frating', 'Great Bromley',
            'Great Horkesley', 'Great Tey', 'Great Wigborough', 'Hardy\'s Green', 'Highwoods',
            'Jaywick', 'Layer Breton', 'Layer Marney', 'Little Bentley', 'Little Clacton',
            'Little Horkesley', 'Little Tey', 'Little Wigborough', 'Marks Tey', 'Mistley',
            'Myland', 'Old Heath', 'Peldon', 'Point Clear', 'Rowhedge', 'Salcott', 'St Osyth',
            'Stanway', 'Tendring', 'Thorpe-le-Soken', 'Tolleshunt D\'Arcy', 'Tolleshunt Knights',
            'West Mersea', 'White Colne', 'Wivenhoe', 'Wivenhoe Park', 'Wrabness'
        ]
    },
    {
        county: 'Essex (Southend & South)',
        postcodePrefixes: ['SS'],
        towns: [
            'Southend-on-Sea', 'Basildon', 'Grays', 'Thurrock', 'Canvey Island', 'Benfleet',
            'Leigh-on-Sea', 'Rayleigh', 'Rochford', 'Stanford-le-Hope', 'Tilbury', 'Corringham',
            'Hadleigh', 'Hockley', 'Pitsea', 'South Benfleet', 'Wickford', 'Ashingdon', 'Barling Magna',
            'Battlesbridge', 'Bowers Gifford', 'Burnham-on-Crouch',
            'Foulness Island', 'Great Wakering', 'Hullbridge', 'Laindon', 'Langdon Hills',
            'Nevendon', 'North Benfleet', 'Rawreth', 'South Fambridge', 'South Woodham Ferrers',
            'Vange', 'Wakering', 'Westcliff-on-Sea', 'Aveley', 'Chafford Hundred', 'Chadwell St Mary',
            'East Tilbury', 'Fobbing', 'Grays Thurrock', 'Horndon on the Hill', 'Little Thurrock',
            'Ockendon', 'Orsett', 'Purfleet', 'South Ockendon', 'Stifford Clays', 'West Thurrock',
            'Althorne', 'Ashingdon', 'Barling Magna', 'Basildon', 'Benfleet', 'Billericay',
            'Bradwell-on-Sea', 'Canvey Island', 'Chadwell St Mary', 'Corringham', 'Downham',
            'Eastwood', 'Fambridge', 'Fobbing', 'Great Wakering', 'Hadleigh', 'Hawkwell',
            'Hockley', 'Hullbridge', 'Laindon', 'Langdon Hills', 'Leigh-on-Sea', 'Little Burstead',
            'Little Wakering', 'Nevendon', 'North Benfleet', 'Pitsea', 'Rawreth', 'Rayleigh',
            'Rochford', 'Runwell', 'Shotgate', 'South Fambridge', 'South Woodham Ferrers',
            'Southend-on-Sea', 'Stambridge', 'Stanford-le-Hope', 'Thundersley', 'Tilbury',
            'Vange', 'Wakering', 'Westcliff-on-Sea', 'Wickford', 'Woodham Ferrers'
        ]
    },
    {
        county: 'Norfolk',
        postcodePrefixes: ['NR', 'PE30', 'PE31', 'PE32', 'PE33', 'PE34', 'PE35', 'PE36', 'PE37', 'PE38'],
        towns: [
            'Norwich', 'Great Yarmouth', 'King\'s Lynn', 'Thetford', 'Dereham', 'Wymondham',
            'Fakenham', 'Cromer', 'Sheringham', 'Attleborough', 'Aylsham', 'Downham Market',
            'Holt', 'North Walsham', 'Reepham', 'Swaffham', 'Wells-next-the-Sea', 'Wroxham',
            'Diss', 'Harleston', 'Loddon', 'Stalham', 'Watton', 'Acle', 'Blofield', 'Bradwell',
            'Caister-on-Sea', 'Costessey', 'Cringleford', 'Dersingham', 'East Harling', 'Gaywood',
            'Gorleston-on-Sea', 'Hemsby', 'Hethersett', 'Hoveton', 'Long Stratton', 'Mundesley',
            'New Costessey', 'Old Catton', 'Poringland', 'Rackheath', 'Red Lodge', 'Reepham',
            'Sprowston', 'Thorpe St Andrew', 'Trowse Newton', 'West Winch',
            'Winterton-on-Sea', 'Yarmouth', 'Ashill', 'Bacton', 'Banham', 'Beetley',
            'Blakeney', 'Burnham Market', 'Caston', 'Claxton', 'Coltishall', 'Corpusty',
            'Cringleford', 'Denver', 'Ditchingham', 'East Runton', 'Feltwell', 'Fersfield',
            'Foulsham', 'Garboldisham', 'Gillingham', 'Great Bircham', 'Great Cressingham',
            'Happisburgh', 'Hempnall', 'Hingham', 'Ingham', 'Kenninghall', 'Ketteringham',
            'Kirstead', 'Lessingham', 'Litcham', 'Little Snoring', 'Loddon', 'Long Stratton',
            'Ludham', 'Martham', 'Mattishall', 'Morley St Botolph', 'Mulbarton', 'Mundford',
            'Neatishead', 'New Buckenham', 'Newton Flotman', 'North Lopham', 'Old Buckenham',
            'Overstrand', 'Pulham Market', 'Pulham St Mary', 'Quidenham', 'Rackheath',
            'Reepham', 'Ringland', 'Rockland St Mary', 'Roydon', 'Runton', 'Salhouse',
            'Saxlingham Nethergate', 'Scole', 'Snettisham', 'South Walsham', 'Sporle',
            'Stoke Holy Cross', 'Strumpshaw', 'Tasburgh', 'Terrington St Clement',
            'Thornham', 'Titchwell', 'Trunch', 'Upwell', 'Walpole St Peter', 'Weasenham St Peter',
            'West Acre', 'West Runton', 'Wicklewood', 'Wiggenhall St Germans', 'Wighton',
            'Winfarthing', 'Wreningham', 'Wretton', 'Yaxham'
        ]
    },
    {
        county: 'Suffolk',
        postcodePrefixes: ['IP', 'CO10', 'CO11', 'CO12', 'CO13', 'CO14', 'CO15', 'CO16'],
        towns: [
            'Ipswich', 'Bury St Edmunds', 'Lowestoft', 'Felixstowe', 'Newmarket', 'Sudbury',
            'Stowmarket', 'Beccles', 'Aldeburgh', 'Framlingham', 'Brandon', 'Bungay',
            'Eye', 'Hadleigh', 'Halesworth', 'Leiston', 'Mildenhall', 'Saxmundham', 'Southwold',
            'Clare', 'Debenham', 'Lavenham', 'Needham Market', 'Stradbroke', 'Woodbridge',
            'Blythburgh', 'Capel St Mary', 'Corton', 'East Bergholt', 'Elmswell',
            'Fressingfield', 'Glemsford', 'Great Cornard', 'Holbrook', 'Kessingland', 'Lakenheath',
            'Long Melford', 'Martlesham Heath', 'Nayland', 'Oulton Broad', 'Pakefield', 'Rattlesden',
            'Shotley Gate', 'Sizewell', 'Thorpeness', 'Walberswick', 'Wangford', 'Wickham Market',
            'Woolpit', 'Yoxford', 'Acton', 'Bacton', 'Bardwell', 'Bildeston', 'Blythburgh',
            'Botesdale', 'Boxford', 'Bramford', 'Brampton', 'Bredfield', 'Bures St Mary',
            'Cavendish', 'Charsfield', 'Chedburgh', 'Claydon', 'Coddenham', 'Combs',
            'Cratfield', 'Dalham', 'Dennington', 'Drinkstone', 'East Bergholt', 'Elmswell',
            'Euston', 'Exning', 'Fornham St Martin', 'Fressingfield', 'Gazeley', 'Gislingham',
            'Great Blakenham', 'Great Finborough', 'Great Waldingfield', 'Grundisburgh',
            'Harkstead', 'Hartest', 'Haughley', 'Higham', 'Hintlesham', 'Honington',
            'Hoxne', 'Ixworth', 'Kedington', 'Kersey', 'Kewstoke', 'Laxfield', 'Little Bealings',
            'Little Cornard', 'Little Glemham', 'Long Melford', 'Lound', 'Market Weston',
            'Metfield', 'Monks Eleigh', 'Moulton', 'Mutford', 'Nacton', 'Needham Market',
            'Newbourne', 'Old Newton', 'Otley', 'Palgrave', 'Parham', 'Polstead', 'Preston St Mary',
            'Rendlesham', 'Risby', 'Rougham', 'Saxtead', 'Semer', 'Shimpling', 'Snape',
            'Sproughton', 'Stanningfield', 'Stanton', 'Stutton', 'Sweffling', 'Thelnetham',
            'Thurston', 'Trimley St Martin', 'Ufford', 'Wenhaston', 'West Row', 'Wickhambrook',
            'Wickham Skeith', 'Wingfield', 'Witnesham', 'Worlingworth', 'Wyverstone'
        ]
    },

    // --- EAST MIDLANDS ---
    {
        county: 'Derbyshire',
        postcodePrefixes: ['DE', 'S18', 'S40', 'S41', 'S42', 'S43', 'SK17', 'SK22', 'SK23'],
        towns: [
            'Derby', 'Chesterfield', 'Ilkeston', 'Swadlincote', 'Long Eaton', 'Belper',
            'Ripley', 'Glossop', 'Buxton', 'Matlock', 'Ashbourne', 'Dronfield',
            'Heanor', 'Alfreton', 'Borrowash', 'Melbourne', 'Repton', 'Sandiacre',
            'Shardlow', 'Somercotes', 'Wirksworth', 'Ambergate', 'Bakewell', 'Bolsover',
            'Breaston', 'Castle Donington', 'Chapel-en-le-Frith', 'Clay Cross', 'Creswell', 'Crich',
            'Darley Dale', 'Duffield', 'Eckington', 'Etwall', 'Hilton', 'Killamarsh',
            'Kilburn', 'Littleover', 'Mackworth', 'Mickleover', 'New Mills', 'Ockbrook',
            'Shirebrook', 'Sinfin', 'Spondon', 'Stapleford', 'Tibshelf', 'Whaley Bridge',
            'Willington', 'Ashover', 'Baslow', 'Bolsover', 'Bonsall', 'Borrowash', 'Bradwell',
            'Breadsall', 'Calver', 'Castleton', 'Clowne', 'Codnor', 'Denby', 'Draycott',
            'Eckington', 'Elvaston', 'Etwall', 'Eyam', 'Fenny Bentley', 'Froggatt',
            'Grassmoor', 'Great Longstone', 'Grindleford', 'Hadfield', 'Hartington',
            'Hathersage', 'Holbrook', 'Hope', 'Horsley', 'Kedleston', 'Mapperley',
            'Marston Montgomery', 'Newbold', 'Newton Solney', 'Overseal', 'Peak Forest',
            'Pilsley', 'Pleasley', 'Pye Bridge', 'Rowsley', 'Shirland', 'South Normanton',
            'Stanley', 'Stanton by Dale', 'Staveley', 'Stoney Middleton', 'Sutton Scarsdale',
            'Tideswell', 'Tintwistle', 'Wessington', 'West Hallam', 'Whitwell', 'Youlgreave'
        ]
    },
    {
        county: 'Leicestershire',
        postcodePrefixes: ['LE'],
        towns: [
            'Leicester', 'Loughborough', 'Hinckley', 'Coalville', 'Melton Mowbray', 'Market Harborough',
            'Ashby-de-la-Zouch', 'Syston', 'Oadby', 'Wigston', 'Shepshed', 'Barrow upon Soar',
            'Mountsorrel', 'Rothley', 'Quorn', 'Anstey', 'Thurmaston', 'Sileby', 'Earl Shilton',
            'Enderby', 'Ibstock', 'Lutterworth', 'Markfield', 'Measham', 'Narborough',
            'Birstall', 'Blaby', 'Braunstone Town', 'Countesthorpe', 'Groby', 'Kirby Muxloe',
            'Newbold Verdon', 'Ratby', 'Sapcote', 'Stoney Stanton', 'Whetstone',
            'Broughton Astley', 'Burbage', 'Desford', 'Fleckney', 'Glenfield', 'Great Glen',
            'Hathern', 'Kibworth', 'Kegworth', 'Long Clawson', 'Waltham on the Wolds',
            'Appleby Magna', 'Asfordby', 'Ashby Woulds', 'Barlestone', 'Bottesford', 'Breedon on the Hill',
            'Burton on the Wolds', 'Castle Donington', 'Catthorpe', 'Charnwood', 'Claybrooke Magna',
            'Congerstone', 'Coston', 'Croft', 'Diseworth', 'Donisthorpe', 'East Goscote', 'Fleckney',
            'Foxton', 'Frisby on the Wreake', 'Gilmorton', 'Great Dalby', 'Great Easton', 'Grimston',
            'Hallaton', 'Hathern', 'Hoton', 'Hugglescote', 'Husbands Bosworth', 'Kegworth', 'Keyham',
            'Kibworth Beauchamp', 'Kirby Muxloe', 'Knossington', 'Leire', 'Little Stretton',
            'Long Whatton', 'Lubenham', 'Measham', 'Misterton', 'Newbold Verdon', 'Newtown Linford',
            'Normanton le Heath', 'Osgathorpe', 'Packington', 'Peckleton', 'Ravenstone', 'Rearsby',
            'Redmile', 'Saddington', 'Scalford', 'Shackerstone', 'Shepshed', 'Sileby', 'Somerby',
            'South Kilworth', 'Stathern', 'Stoke Golding', 'Sutton Cheney', 'Swannington', 'Swinford',
            'Teigh', 'Thurnby', 'Tilton on the Hill', 'Tugby', 'Waltham on the Wolds', 'Wartnaby',
            'Wigston Parva', 'Withcote', 'Wymeswold'
        ]
    },
    {
        county: 'Lincolnshire',
        postcodePrefixes: ['LN', 'PE9', 'PE10', 'PE11', 'PE12', 'PE20', 'PE21', 'PE22', 'PE23', 'PE24', 'PE25'],
        towns: [
            'Lincoln', 'Gainsborough', 'Market Rasen', 'Sleaford', 'Woodhall Spa', 'North Hykeham',
            'Caistor', 'Nettleham', 'Saxilby', 'Waddington', 'Welton', 'Alford', 'Bardney',
            'Bassingham', 'Bracebridge Heath', 'Cherry Willingham', 'Coningsby', 'Eagle',
            'Fiskerton', 'Heckington', 'Horncastle', 'Ingoldmells', 'Kirkby on Bain', 'Mablethorpe',
            'Metheringham', 'Navenby', 'Ruskington', 'Skegness', 'Spilsby', 'Tattershall',
            'Wragby', 'Stamford', 'Spalding', 'Boston', 'Grantham', 'Holbeach', 'Bourne',
            'Donington', 'Long Sutton', 'Pinchbeck', 'Sutton Bridge', 'Swineshead',
            'Wainfleet All Saints', 'Billingborough', 'Crowland', 'Deeping St James',
            'Folkingham', 'Gedney', 'Gosberton', 'Kirton', 'Market Deeping', 'Moulton',
            'Surfleet', 'Thurlby', 'West Pinchbeck', 'Ancaster', 'Bardney', 'Barrowby',
            'Baston', 'Beckingham', 'Belmont', 'Binbrook', 'Blyton', 'Branston', 'Brigg',
            'Burton', 'Byard\'s Leap', 'Caistor', 'Chapel St Leonards', 'Colsterworth',
            'Corby Glen', 'Covenham St Bartholomew', 'Cranwell', 'Deeping St Nicholas',
            'Digby', 'Donington on Bain', 'Dowsby', 'Dunholme', 'East Heckington', 'Ewerby',
            'Faldingworth', 'Fiskerton', 'Fosdyke', 'Foston', 'Freiston', 'Friskney',
            'Fulbeck', 'Gedney Hill', 'Glanford Brigg', 'Goulceby', 'Great Gonerby',
            'Great Ponton', 'Grimsby', 'Haxey', 'Healing', 'Hemswell', 'Hibaldstow',
            'Holton le Clay', 'Honington', 'Huttoft', 'Ingham', 'Keadby', 'Keelby',
            'Killingholme', 'Kirkby la Thorpe', 'Kirmington', 'Laceby', 'Lea', 'Leadenham',
            'Legbourne', 'Little Steeping', 'Long Bennington', 'Louth', 'Ludford',
            'Manby', 'Mareham le Fen', 'Marshchapel', 'Marton', 'Mawthorpe', 'Midville',
            'Morton', 'Navenby', 'New Leake', 'North Cotes', 'North Somercotes', 'North Thoresby',
            'Old Leake', 'Osgodby', 'Partney', 'Pickworth', 'Pointon', 'Potterhanworth',
            'Quadring', 'Raithby', 'Rauceby', 'Revesby', 'Riby', 'Saltfleet', 'Saxilby',
            'Scotter', 'Scunthorpe', 'Sibsey', 'Skellingthorpe', 'South Killingholme',
            'South Witham', 'Spalford', 'Sutton on Sea', 'Swineshead', 'Tetney', 'Thurlby',
            'Toynton All Saints', 'Uffington', 'Waddington', 'Waltham', 'Welbourn',
            'Welton', 'West Ashby', 'West Butterwick', 'West Deeping', 'Whaplode',
            'Wilsford', 'Winterton', 'Witham on the Hill', 'Wyberton'
        ]
    },
    {
        county: 'Northamptonshire',
        postcodePrefixes: ['NN'],
        towns: [
            'Northampton', 'Corby', 'Kettering', 'Wellingborough', 'Daventry', 'Rushden',
            'Towcester', 'Brackley', 'Desborough', 'Oundle', 'Rothwell', 'Burton Latimer',
            'Higham Ferrers', 'Irthlingborough', 'Raunds', 'Thrapston', 'Broughton', 'Cogenhoe',
            'Earls Barton', 'Finedon', 'Geddington', 'Great Addington', 'Little Irchester',
            'Orlingbury', 'Ringstead', 'Stanwick', 'Wollaston', 'Brixworth', 'Roade', 'Weedon Bec',
            'Bugbrooke', 'Chapel Brampton', 'Duston', 'East Hunsbury', 'Gayton', 'Grange Park',
            'Great Houghton', 'Hardingstone', 'Kingsthorpe', 'Moulton', 'Nether Heyford', 'Old Stratford',
            'Pitsford', 'Silverstone', 'Spratton', 'West Hunsbury', 'Yardley Gobion',
            'Abington', 'Aldwincle', 'Apethorpe', 'Ashley', 'Ashton', 'Badby', 'Barby',
            'Barton Seagrave', 'Benefield', 'Blisworth', 'Bozeat', 'Braunston', 'Braybrooke',
            'Brington', 'Byfield', 'Canons Ashby', 'Castle Ashby', 'Charwelton', 'Clipston',
            'Cranford', 'Crick', 'Croughton', 'Denford', 'Denton', 'Dingley', 'Dodford',
            'East Carlton', 'East Farndon', 'East Haddon', 'Eastcote', 'Ecton', 'Evenley',
            'Farthingstone', 'Flore', 'Great Brington', 'Great Cransley', 'Great Doddington',
            'Great Oxendon', 'Grendon', 'Gretton', 'Guilsborough', 'Hannington', 'Harringworth',
            'Harpole', 'Hellidon', 'Helmdon', 'Higham Ferrers', 'Hollowell', 'Irchester',
            'Kelmarsh', 'Kings Sutton', 'Kislingbury', 'Lamport', 'Lilbourne', 'Long Buckby',
            'Maidwell', 'Marston Trussell', 'Middleton Cheney', 'Moulton', 'Naseby', 'Newbottle',
            'Norton', 'Old', 'Pattishall', 'Paulerspury', 'Pitsford', 'Potterspury', 'Preston Capes',
            'Pytchley', 'Ravensthorpe', 'Ringstead', 'Scaldwell', 'Sibbertoft', 'Slapton',
            'Southwick', 'Spratton', 'Stoke Bruerne', 'Sulgrave', 'Syresham', 'Thenford',
            'Thrapston', 'Tiffield', 'Upper Boddington', 'Wappenham', 'Warmington', 'West Haddon',
            'Weston Favell', 'Whilton', 'Wicken', 'Wilbarston', 'Winwick', 'Woodford Halse',
            'Yardley Hastings', 'Yelvertoft'
        ]
    },
    {
        county: 'Nottinghamshire',
        postcodePrefixes: ['NG'],
        towns: [
            'Nottingham', 'Mansfield', 'Worksop', 'Newark-on-Trent', 'Beeston', 'Arnold',
            'Carlton', 'Sutton-in-Ashfield', 'Kirkby-in-Ashfield', 'Hucknall', 'Retford', 'Southwell',
            'Eastwood', 'Stapleford', 'Long Eaton', 'Bingham', 'Cotgrave', 'Keyworth',
            'Ollerton', 'Rainworth', 'Tuxford', 'Warsop', 'Blidworth', 'Clipstone', 'Cuckney',
            'Edwinstowe', 'Farnsfield', 'Harworth', 'Kirkby Woodhouse', 'Langold', 'Misterton',
            'Ranskill', 'Selston', 'Shirebrook', 'Sutton-on-Trent', 'Walkeringham',
            'Calverton', 'Edwalton', 'Kimberley', 'Ruddington', 'Toton',
            'Annesley', 'Aslockton', 'Awsworth', 'Balderton', 'Bilsthorpe', 'Bleasby',
            'Blyth', 'Bottesford', 'Boughton', 'Brinsley', 'Bulwell', 'Bunny',
            'Burton Joyce', 'Car Colston', 'Carlton in Lindrick', 'Caythorpe', 'Clifton',
            'Collingham', 'Costock', 'Cropwell Bishop', 'East Leake', 'Eastwood', 'Eaton',
            'Epperstone', 'Everton', 'Farndon', 'Farnsfield', 'Flintham', 'Gedling',
            'Giltbrook', 'Greasley', 'Gringley on the Hill', 'Halam', 'Hawton', 'Hickling',
            'Holme Pierrepont', 'Hoveringham', 'Keyworth', 'Kilvington', 'Kingston on Soar',
            'Kinoulton', 'Lambley', 'Laneham', 'Linby', 'Lowdham', 'Mansfield Woodhouse',
            'Maplebeck', 'Mattersey', 'Misterton', 'Moorgreen', 'Netherfield', 'Norwell',
            'Nuthall', 'Old Basford', 'Ollerton', 'Orston', 'Oxton', 'Papplewick',
            'Papplewick Green', 'Radcliffe on Trent', 'Ragnall', 'Rampton', 'Rempstone',
            'Rolleston', 'Rufford', 'Saxondale', 'Screveton', 'Shelford', 'Sibthorpe',
            'South Leverton', 'Southwell', 'Stanton on the Wolds', 'Sutton Bonington',
            'Sutton in Ashfield', 'Thrumpton', 'Tollerton', 'Trowell', 'Walesby', 'Walkeringham',
            'Wallingwells', 'Warsop', 'Whatton', 'Wollaton', 'Woodborough'
        ]
    },

    // --- NORTH EAST ENGLAND ---
    {
        county: 'County Durham',
        postcodePrefixes: ['DH', 'DL1', 'DL2', 'DL3', 'DL4', 'DL5', 'DL14', 'DL15', 'DL16', 'DL17'],
        towns: [
            'Durham', 'Chester-le-Street', 'Consett', 'Stanley', 'Seaham', 'Peterlee',
            'Annfield Plain', 'Blackhall Colliery', 'Bowburn', 'Brandon', 'Coxhoe',
            'Easington Colliery', 'Ferryhill', 'Lanchester', 'Spennymoor', 'Wingate',
            'Bearpark', 'Burnhope', 'Cassop', 'Chilton', 'Crook', 'Darlington', 'Bishop Auckland',
            'Newton Aycliffe', 'Shildon', 'Barnard Castle', 'Evenwood', 'Gainford', 'Middleton-in-Teesdale',
            'Staindrop', 'Tow Law', 'Willington', 'Aycliffe Village', 'Binchester', 'Bishopton',
            'Boldon Colliery', 'Bowes', 'Bradbury', 'Brancepeth', 'Butterknowle', 'Caldwell',
            'Castle Eden', 'Catchgate', 'Catterick', 'Chilton', 'Close House', 'Cockfield',
            'Collierley', 'Cornforth', 'Coundon', 'Croxdale', 'Denton', 'Eastgate',
            'Edmondsley', 'Eldon', 'Escomb', 'Esh', 'Evenwood Gate', 'Ferryhill Station',
            'Fishburn', 'Frosterley', 'Hamsterley', 'Haswell', 'High Pittington', 'Horden',
            'Hunwick', 'Hurworth-on-Tees', 'Kelloe', 'Kimblesworth', 'Kirk Merrington',
            'Langley Moor', 'Leadgate', 'Little Lumley', 'Low Pittington', 'Lumley',
            'Mainsforth', 'Medomsley', 'Middleton St George', 'Monk Hesleden', 'Moorhouse',
            'Netherton', 'New Brancepeth', 'Oakenshaw', 'Old Cassop', 'Ouston', 'Parkside',
            'Pelton', 'Pittington', 'Plawsworth', 'Ramshaw', 'Sacriston', 'Satley',
            'Sherburn', 'Sherburn Hill', 'Shotton Colliery', 'South Hetton', 'St Helen Auckland',
            'St John\'s Chapel', 'Stainton', 'Stanhope', 'Sunniside', 'Thornley', 'Trimdon',
            'Trimdon Grange', 'Trimdon Station', 'Tudhoe', 'Wackerfield', 'Waldridge',
            'West Auckland', 'West Cornforth', 'West Rainton', 'Whorlton', 'Witton-le-Wear',
            'Wolsingham', 'Woodhouse Close', 'Woodstone Village'
        ]
    },
    {
        county: 'Northumberland',
        postcodePrefixes: ['NE18', 'NE19', 'NE20', 'NE22', 'NE24', 'NE42', 'NE43', 'NE44', 'NE45', 'NE46', 'NE47', 'NE48', 'NE49', 'NE61', 'NE62', 'NE63', 'NE64', 'NE65', 'NE66', 'NE67', 'NE68', 'NE69', 'NE70', 'NE71'],
        towns: [
            'Morpeth', 'Hexham', 'Alnwick', 'Berwick-upon-Tweed', 'Ashington', 'Blyth',
            'Cramlington', 'Prudhoe', 'Corbridge', 'Rothbury', 'Amble', 'Bedlington',
            'Haltwhistle', 'Newbiggin-by-the-Sea', 'Ponteland', 'Bellingham', 'Etal', 'Ford',
            'Haydon Bridge', 'Kielder', 'Longframlington', 'Otterburn', 'Seahouses', 'Slaley',
            'Stocksfield', 'Warkworth', 'Acklington', 'Adderstone', 'Allendale', 'Alnmouth',
            'Ancroft', 'Bamburgh', 'Bardon Mill', 'Barrasford', 'Beadnell', 'Belford',
            'Belsay', 'Blanchland', 'Blyth', 'Bothal', 'Branxton', 'Broomhill', 'Bywell',
            'Capheaton', 'Chathill', 'Chollerford', 'Coanwood', 'Coldstream', 'Craster',
            'Doddington', 'Eglingham', 'Ellingham', 'Embleton', 'Eshott', 'Felton',
            'Ford', 'Glanton', 'Greenhead', 'Hadston', 'Harbottle', 'Hauxley', 'Heddon-on-the-Wall',
            'Hepple', 'High Newton-by-the-Sea', 'Holy Island', 'Horsley', 'Ilderton', 'Ingram',
            'Kielder Forest', 'Kirknewton', 'Lesbury', 'Longhorsley', 'Lowick', 'Lynemouth',
            'Matfen', 'Middleton', 'Milfield', 'Mitford', 'Nedderton', 'Newton-by-the-Sea',
            'Norham', 'North Sunderland', 'Nunnykirk', 'Ovingham', 'Pegswood', 'Rennington',
            'Rochester', 'Ryal', 'Seaton Delaval', 'Shilbottle', 'Slaley', 'Stannington',
            'Stocksfield', 'Swalwell', 'Thorneyburn', 'Thropton', 'Ulgham', 'Wall', 'Wark',
            'Warkworth', 'West Woodburn', 'Whalton', 'Widdrington', 'Wooler'
        ]
    },
    {
        county: 'Teesside (Cleveland)',
        postcodePrefixes: ['TS'],
        towns: [
            'Middlesbrough', 'Stockton-on-Tees', 'Redcar', 'Billingham', 'Thornaby-on-Tees',
            'Guisborough', 'Saltburn-by-the-Sea', 'Loftus', 'Skelton-in-Cleveland', 'Yarm',
            'Eston', 'Grangetown', 'Marske-by-the-Sea', 'Normanby', 'Nunthorpe', 'Ormesby',
            'Acklam', 'Ayresome', 'Berwick Hills', 'Coulby Newham', 'Hemlington', 'Linthorpe',
            'Marton', 'North Ormesby', 'Pallister Park', 'Park End', 'Stainton', 'Thorntree',
            'Boosbeck', 'Brotton', 'Castleton', 'Commondale', 'Danby', 'Egton', 'Grosmont',
            'Hawsker', 'Hinderwell', 'Kirkleatham', 'Lazenby', 'Lingdale', 'Liverton Mines',
            'Lythe', 'Moorsholm', 'New Marske', 'Newton under Roseberry', 'Normanby',
            'Old Lackenby', 'Pinchinthorpe', 'Redcar East', 'Runswick Bay', 'Sandsend',
            'Sleights', 'South Bank', 'Staithes', 'Teesville', 'Thornaby', 'Tranmere',
            'Wilton', 'Wolviston'
        ]
    },
    {
        county: 'Tyne and Wear (Newcastle City)',
        postcodePrefixes: ['NE1', 'NE2', 'NE3', 'NE4', 'NE5', 'NE6', 'NE7', 'NE8', 'NE12', 'NE13', 'NE15', 'NE20'],
        towns: [
            'Newcastle upon Tyne', 'Gosforth', 'Kenton', 'Wallsend', 'Byker', 'Fenham',
            'Heaton', 'Jesmond', 'Lemington', 'Longbenton', 'Newburn', 'Throckley',
            'Walker', 'Westerhope', 'Wideopen', 'Woolsington', 'Blakelaw', 'Cowgate',
            'Denton Burn', 'Elswick', 'Fawdon', 'High Heaton', 'Kenton Bar', 'Kingston Park',
            'Scotswood', 'Shieldfield', 'Walkergate', 'Arthur\'s Hill', 'Benwell', 'Blackfriars',
            'Central Station', 'Chinatown', 'City Centre', 'Cragside', 'Denton', 'Dinnington',
            'East Denton', 'East Gosforth', 'Fenham Barracks', 'Fosseway', 'Gateshead',
            'Gosforth Park', 'Grainger Town', 'Hadrian Park', 'Haymarket', 'Hazlerigg',
            'High Heaton', 'Kenton Bank Foot', 'Kenton Lodge', 'Kingston Park', 'Lemington Riverside',
            'Longbenton Estate', 'Middleton', 'Millway', 'Montagu Estate', 'Newburn Haugh',
            'North Gosforth', 'North Kenton', 'North Walbottle', 'Ouseburn', 'Parklands',
            'Quayside', 'Regent Centre', 'Spital Tongues', 'St James\' Park', 'St Peter\'s',
            'Sugley', 'Team Valley', 'Throckley', 'Walker Gate', 'West Denton', 'West Gosforth',
            'Westgate', 'Whitehouse Farm', 'Wideopen', 'Wingrove', 'Woolsington'
        ]
    },
    {
        county: 'Tyne and Wear (Gateshead & South Tyneside)',
        postcodePrefixes: ['NE9', 'NE10', 'NE11', 'NE16', 'NE17', 'NE21', 'NE31', 'NE32', 'NE33', 'NE34', 'NE35', 'NE36', 'NE37', 'NE38', 'NE39', 'NE40', 'NE41'],
        towns: [
            'Gateshead', 'South Shields', 'Jarrow', 'Hebburn', 'Washington', 'Blaydon-on-Tyne',
            'Boldon Colliery', 'Felling', 'Ryton', 'Birtley', 'Chopwell', 'Dunston',
            'Low Fell', 'Pelaw', 'Rowlands Gill', 'Whickham', 'Winlaton', 'Cleadon',
            'East Boldon', 'Monkton', 'Simonside', 'West Boldon', 'Whitburn',
            'Annitsford', 'Bede', 'Birtley', 'Blackhall Mill', 'Blaydon', 'Boldon',
            'Broomhaugh', 'Burnopfield', 'Chopwell', 'Clara Vale', 'Crawcrook', 'Crookgate',
            'Dipton', 'Eighton Banks', 'Farnley', 'Felling Shore', 'Gateshead Fell',
            'Gibside', 'Greenside', 'Hamsterley', 'High Spen', 'Kibblesworth', 'Leadgate',
            'Lintzford', 'Longbenton', 'Low Eighton', 'Marley Hill', 'Medomsley', 'Newbottle',
            'Newton Hall', 'Ovingham', 'Pelton Fell', 'Prudhoe', 'Ravensworth', 'Rowlands Gill',
            'Ryton', 'Scotswood', 'Sherburn Village', 'Shotley Bridge', 'South Hylton',
            'Stella', 'Sunniside', 'Swalwell', 'Tanfield', 'Team Valley', 'Throckley',
            'Wardley', 'Washington Village', 'West Denton', 'West Pelton', 'Whickham',
            'Whitehouse Farm', 'Winlaton Mill', 'Wrekenton'
        ]
    },
    {
        county: 'Tyne and Wear (Sunderland & North Tyneside)',
        postcodePrefixes: ['SR', 'NE25', 'NE26', 'NE27', 'NE28', 'NE29', 'NE30'],
        towns: [
            'Sunderland', 'Houghton-le-Spring', 'Hetton-le-Hole', 'Washington', 'Seaburn',
            'Southwick', 'Whitburn', 'Cleadon', 'East Herrington', 'Penshaw',
            'Monkwearmouth', 'Ryhope', 'Silksworth', 'Thornhill', 'Tunall', 'Wearside',
            'Whitley Bay', 'North Shields', 'Tynemouth', 'Cullercoats', 'Killingworth',
            'Longbenton', 'Monkseaton', 'Wallsend', 'Backworth', 'Benton', 'Camperdown',
            'Chirton', 'Earsdon', 'Forest Hall', 'Holystone', 'Howdon', 'Killingworth Village',
            'Longbenton', 'New York', 'North Shields', 'Percy Main', 'Preston', 'Shiremoor',
            'Tynemouth', 'Walker Gate', 'West Allotment', 'West Chirton', 'West Monkseaton',
            'West Moor', 'Whitley Bay'
        ]
    },

    // --- NORTH WEST ENGLAND ---
    {
        county: 'Cheshire (West, Chester & Ellesmere Port)',
        postcodePrefixes: ['CH1', 'CH2', 'CH3', 'CH4', 'CH5', 'CH65', 'CH66'],
        towns: [
            'Chester', 'Ellesmere Port', 'Neston', 'Frodsham', 'Helsby', 'Tarporley',
            'Tattenhall', 'Malpas', 'Aldford', 'Farndon', 'Great Sutton', 'Little Sutton',
            'Capenhurst', 'Childer Thornton', 'Great Barrow', 'Handbridge', 'Hoole', 'Mollington',
            'Pulford', 'Saughall', 'Tiverton', 'Ashton Hayes', 'Backford', 'Blacon', 'Boughton',
            'Broughton', 'Burton', 'Christleton', 'Clutton', 'Dodleston', 'Eccleston',
            'Guilden Sutton', 'Hapsford', 'Higher Kinnerton', 'Ince', 'Lea Newbold', 'Mickle Trafford',
            'Mollington', 'Plemstall', 'Poulton', 'Rowton', 'Saighton', 'Shocklach', 'Stoak',
            'Tarvin', 'Threapwood', 'Tilston', 'Upton by Chester', 'Waverton', 'Wimbolds Trafford'
        ]
    },
    {
        county: 'Cheshire (East & Mid)',
        postcodePrefixes: ['CW', 'SK9', 'SK10', 'SK11', 'SK12', 'SK23'],
        towns: [
            'Crewe', 'Macclesfield', 'Congleton', 'Nantwich', 'Sandbach', 'Winsford',
            'Alsager', 'Knutsford', 'Poynton', 'Wilmslow', 'Alderley Edge', 'Bollington',
            'Holmes Chapel', 'Middlewich', 'Northwich', 'Weaverham', 'Audlem', 'Barnton',
            'Bunbury', 'Chapel-en-le-Frith', 'Chelford', 'Cuddington', 'Disley',
            'Goostrey', 'Great Budworth', 'Hartford', 'High Legh', 'Kelsall', 'Lostock Gralam',
            'Mobberley', 'Mottram St Andrew', 'Prestbury', 'Rainow', 'Scholar Green', 'Stockton Heath',
            'Tarvin', 'Whitegate', 'Adlington', 'Allostock', 'Arley', 'Astbury', 'Aston juxta Mondrum',
            'Audlem', 'Baddiley', 'Barthomley', 'Basford', 'Betley', 'Blackden', 'Bosley',
            'Bradwall', 'Brereton', 'Bridgemere', 'Broxton', 'Bucklow Hill', 'Bunbury',
            'Burland', 'Calveley', 'Capesthorne', 'Checkley', 'Church Lawton', 'Church Minshull',
            'Comberbach', 'Cranage', 'Crowton', 'Davenham', 'Dodleston', 'Eaton',
            'Elworth', 'Farndon', 'Gawsworth', 'Great Budworth', 'Great Warford', 'Haughton',
            'Higher Peover', 'Holmes Chapel', 'Hough', 'Hulme Walfield', 'Kettleshulme',
            'Kinderton', 'Kingsley', 'Lach Dennis', 'Lea', 'Little Budworth', 'Little Leigh',
            'Lower Peover', 'Lower Withington', 'Marton', 'Mere', 'Minshull Vernon', 'Moston',
            'Nether Alderley', 'Newbold Astbury', 'Oakmere', 'Odd Rode', 'Over Peover',
            'Peover Superior', 'Pickmere', 'Plumley', 'Pott Shrigley', 'Prestbury', 'Radway Green',
            'Rainow', 'Rode Heath', 'Rostherne', 'Rudheath', 'Rushton', 'Scholar Green',
            'Siddington', 'Snelson', 'Somerford Booths', 'Sutton', 'Tabley Inferior',
            'Tabley Superior', 'Tarporley', 'Tattenhall', 'Tilston', 'Twemlow', 'Warmingham',
            'Waverton', 'Wettenhall', 'Whirley', 'Whitegate', 'Wincle', 'Wybunbury'
        ]
    },
    {
        county: 'Cumbria (North & West)',
        postcodePrefixes: ['CA'],
        towns: [
            'Carlisle', 'Penrith', 'Workington', 'Maryport', 'Cockermouth', 'Keswick',
            'Wigton', 'Aspatria', 'Brampton', 'Dalston', 'Longtown', 'Silloth',
            'Alston', 'Appleby-in-Westmorland', 'Armathwaite', 'Bowness-on-Solway', 'Caldbeck',
            'Calthwaite', 'Cotehill', 'Denton Holme', 'Great Clifton', 'Haltwhistle',
            'Kirkby Stephen', 'Lazonby', 'Melmerby', 'Orton', 'Plumbland', 'Ravenstonedale',
            'Shap', 'Skelton', 'Temple Sowerby', 'Wetheral', 'Allonby', 'Bassenthwaite',
            'Bewcastle', 'Blencowe', 'Borrowdale', 'Bothel', 'Brampton', 'Bridgefoot',
            'Broughton Moor', 'Burgh by Sands', 'Caldbeck', 'Calthwaite', 'Cotehill',
            'Cumwhinton', 'Dacre', 'Dearham', 'Distington', 'Drumburgh', 'Eamont Bridge',
            'Flimby', 'Frizington', 'Gilcrux', 'Glasson', 'Great Orton', 'Greystoke',
            'Hallbankgate', 'Hesket Newmarket', 'High Harrington', 'Holme St Cuthbert',
            'Johnby', 'Kirkbampton', 'Kirkbride', 'Langwathby', 'Lorton', 'Loweswater',
            'Moor Row', 'Nether Row', 'Newton Arlosh', 'Oughterside', 'Patterdale',
            'Plumpton', 'Portinscale', 'Renwick', 'Rockcliffe', 'Scaleby', 'Seascale',
            'Skelton', 'Southwaite', 'St Bees', 'Talkin', 'Threlkeld', 'Ullswater',
            'Wetheral', 'Wreay'
        ]
    },
    {
        county: 'Cumbria (South & Lakes)',
        postcodePrefixes: ['LA'],
        towns: [
            'Kendal', 'Barrow-in-Furness', 'Ulverston', 'Windermere', 'Grange-over-Sands',
            'Milnthorpe', 'Arnside', 'Coniston', 'Hawkshead', 'Kirkby Lonsdale', 'Sedbergh',
            'Ambleside', 'Backbarrow', 'Bootle', 'Broughton-in-Furness', 'Burton-in-Kendal',
            'Cark-in-Cartmel', 'Cartmel', 'Dent', 'Flookburgh', 'Grasmere', 'Greenodd',
            'Heversham', 'Kirkby-in-Furness', 'Levens', 'Lindal-in-Furness', 'Low Newton',
            'Newby Bridge', 'Oxenholme', 'Pooley Bridge', 'Staveley', 'Troutbeck', 'Witherslack',
            'Allithwaite', 'Bowness-on-Windermere', 'Burneside', 'Casterton', 'Chapel Stile',
            'Crook', 'Dentdale', 'Endmoor', 'Garsdale', 'Garsdale Head', 'Grange-in-Borrowdale',
            'Grayrigg', 'Great Langdale', 'Haverthwaite', 'Ingleton', 'Kendal', 'Kentmere',
            'Levens', 'Lowick', 'Lune Valley', 'Mansergh', 'Meathop', 'Natland', 'Newby Bridge',
            'Old Hutton', 'Oxenholme', 'Penny Bridge', 'Ravenstonedale', 'Rusland', 'Satterthwaite',
            'Selside', 'Staveley-in-Cartmel', 'Tebay', 'Torver', 'Underbarrow', 'Urswick',
            'Warton', 'Whinfell', 'Whitwell', 'Witherslack', 'Yealand Conyers'
        ]
    },
    {
        county: 'Greater Manchester (Manchester City Centre)',
        postcodePrefixes: ['M1', 'M2', 'M3', 'M4', 'M50'],
        towns: [
            'Manchester City Centre', 'Salford Quays', 'Spinningfields', 'Northern Quarter',
            'Castlefield', 'Ancoats', 'New Islington', 'Deansgate', 'Piccadilly', 'Victoria Park',
            'Ardwick', 'Beswick', 'Bradford', 'Cheetham Hill', 'Chorlton-on-Medlock', 'Collyhurst',
            'Cornbrook', 'Gorton', 'Hulme', 'Miles Platting', 'Moss Side', 'Newton Heath',
            'Openshaw', 'Ordsall', 'Rusholme', 'Strangeways', 'Trafford Park', 'Ardwick Green',
            'Brunswick', 'Canning Town', 'Clayton', 'Cornbrook', 'Cross Lane', 'Droylsden',
            'Eastlands', 'Fallowfield', 'Higher Openshaw', 'Hulme', 'Longsight', 'Lower Crumpsall',
            'Lower Openshaw', 'Medlock', 'Miles Platting', 'Moss Side', 'Newton Heath', 'Openshaw',
            'Piccadilly Gardens', 'Pomona', 'Princess Road', 'Rusholme', 'Salford', 'Sportcity',
            'Strangeways', 'Victoria Park', 'West Gorton', 'Whitworth Park'
        ]
    },
    {
        county: 'Greater Manchester (South Manchester)',
        postcodePrefixes: ['M13', 'M14', 'M15', 'M16', 'M20', 'M21', 'M22', 'M23', 'M33', 'M41'],
        towns: [
            'Didsbury', 'Chorlton-cum-Hardy', 'Fallowfield', 'Hulme', 'Moss Side', 'Rusholme',
            'Withington', 'Flixton', 'Sale', 'Altrincham', 'Urmston', 'Baguley', 'Benchill',
            'Bredbury', 'Burnage', 'Cheadle', 'Cheadle Hulme', 'Gatley', 'Heald Green', 'Heatons',
            'Northenden', 'Poynton', 'Sharston', 'Timperley', 'Wythenshawe', 'Ashton upon Mersey',
            'Bowdon', 'Broadheath', 'Brooklands', 'Carrington', 'Davyhulme', 'Dunham Massey',
            'Firswood', 'Gorse Hill', 'Hale', 'Hale Barns', 'Longford', 'Lostock', 'Moor Nook',
            'Northern Moor', 'Partington', 'Ringway', 'Sharston', 'Stretford', 'Timperley',
            'Trafford', 'West Didsbury', 'Woodhouse Park', 'Wythenshawe'
        ]
    },
    {
        county: 'Greater Manchester (North Manchester)',
        postcodePrefixes: ['M8', 'M9', 'M10', 'M11', 'M18', 'M19', 'M24', 'M25', 'M27', 'M28', 'M35', 'M40', 'M43'],
        towns: [
            'Blackley', 'Harpurhey', 'Moston', 'Newton Heath', 'Openshaw', 'Gorton',
            'Clayton', 'Miles Platting', 'Failsworth', 'Droylsden', 'Audenshaw', 'Denton',
            'Hyde', 'Stalybridge', 'Ashton-under-Lyne', 'Dukinfield', 'Guide Bridge', 'Hattersley',
            'Hollingworth', 'Mottram in Longdendale', 'Newton', 'Woodley', 'Abbey Hey', 'Ardwick',
            'Baguley', 'Beswick', 'Blackley', 'Bradford', 'Burnage', 'Chorlton-on-Medlock',
            'Clayton', 'Collyhurst', 'Crumpsall', 'Denton', 'Didsbury', 'Droylsden',
            'Fallowfield', 'Gorton', 'Harpurhey', 'Higher Openshaw', 'Hulme', 'Levenshulme',
            'Longsight', 'Lower Crumpsall', 'Lower Openshaw', 'Miles Platting', 'Moss Side',
            'Moston', 'Newton Heath', 'Openshaw', 'Rusholme', 'Sharston', 'Trafford Park',
            'West Gorton', 'Withington', 'Wythenshawe'
        ]
    },
    {
        county: 'Greater Manchester (Bolton & Bury)',
        postcodePrefixes: ['BL', 'M26', 'M38', 'M45'],
        towns: [
            'Bolton', 'Bury', 'Farnworth', 'Horwich', 'Leigh', 'Radcliffe',
            'Ramsbottom', 'Tottington', 'Westhoughton', 'Whitefield', 'Atherton',
            'Blackrod', 'Breightmet', 'Bromley Cross', 'Little Lever', 'Tyldesley',
            'Astley Bridge', 'Blackrod', 'Bradley Fold', 'Bromley Cross', 'Chapeltown',
            'Chequerbent', 'Daisy Hill', 'Darcy Lever', 'Egerton', 'Entwistle', 'Eagley',
            'Edgworth', 'Farnworth', 'Gresford', 'Hall i\' th\' Wood', 'Harwood', 'Heaton',
            'Horwich', 'Kearsley', 'Little Hulton', 'Little Lever', 'Lostock', 'Moses Gate',
            'Over Hulton', 'Prestolee', 'Ringley', 'Rumworth', 'Sharples', 'Smithills',
            'Stoneclough', 'Tong Moor', 'Turton', 'Walkden', 'Walmsley', 'Worsley'
        ]
    },
    {
        county: 'Greater Manchester (Oldham & Rochdale)',
        postcodePrefixes: ['OL'],
        towns: [
            'Oldham', 'Rochdale', 'Middleton', 'Chadderton', 'Royton', 'Shaw', 'Lees',
            'Heywood', 'Milnrow', 'Newhey', 'Littleborough', 'Wardle', 'Castleton',
            'Denshaw', 'Diggle', 'Dobcross', 'Failsworth', 'Greenfield', 'Hollingworth',
            'Lees', 'Saddleworth', 'Springhead', 'Uppermill', 'Ashton-under-Lyne', 'Audenshaw',
            'Chadderton', 'Crompton', 'Delph', 'Denton', 'Diggle', 'Droylsden', 'Dukinfield',
            'Failsworth', 'Friezland', 'Grotton', 'Hathershaw', 'Holts', 'Hurst Cross',
            'Lees', 'Littlemoss', 'Lydgate', 'Micklehurst', 'Moorside', 'Mossley',
            'New Delph', 'Newhey', 'Oldham Edge', 'Park Bridge', 'Royton', 'Saddleworth',
            'Shaw and Crompton', 'Springhead', 'Stalybridge', 'Uppermill', 'Waterhead',
            'Woodhouses'
        ]
    },
    {
        county: 'Greater Manchester (Stockport & Tameside)',
        postcodePrefixes: ['SK1', 'SK2', 'SK3', 'SK4', 'SK5', 'SK6', 'SK7', 'SK8', 'SK13', 'SK14', 'SK15', 'SK16'],
        towns: [
            'Stockport', 'Cheadle', 'Cheadle Hulme', 'Gatley', 'Hazel Grove', 'Marple',
            'Romiley', 'Bredbury', 'Dukinfield', 'Glossop', 'Hyde', 'Stalybridge',
            'Ashton-under-Lyne', 'Denton', 'Hattersley', 'Hollingworth',
            'Mottram in Longdendale', 'Poynton', 'Bramhall', 'Compstall', 'Disley',
            'High Lane', 'New Mills', 'Offerton', 'Reddish', 'Woodley', 'Alderley Edge',
            'Bollington', 'Bosden Farm', 'Bramhall', 'Bredbury Green', 'Brookbottom',
            'Buxton', 'Chapel-en-le-Frith', 'Charlesworth', 'Compstall', 'Crompton Moor',
            'Disley', 'Dove Holes', 'Edgeley', 'Furness Vale', 'Goyt Valley', 'Hadfield',
            'Handforth', 'Hazel Grove', 'High Lane', 'Higher Poynton', 'Kettleshulme',
            'Lakeside', 'Little Hulton', 'Marple Bridge', 'Mellor', 'Middlewood',
            'New Mills', 'Newton', 'Offerton', 'Pott Shrigley', 'Poynton', 'Prestbury',
            'Reddish', 'Romiley', 'Rose Hill', 'Strines', 'Torkington', 'Tytherington',
            'Whaley Bridge', 'Woodford'
        ]
    },
    {
        county: 'Greater Manchester (Wigan)',
        postcodePrefixes: ['WN'],
        towns: [
            'Wigan', 'Leigh', 'Hindley', 'Atherton', 'Golborne', 'Tyldesley',
            'Ashton-in-Makerfield', 'Aspull', 'Billinge', 'Haigh', 'Ince-in-Makerfield',
            'Lowton', 'Orrell', 'Pemberton', 'Platt Bridge', 'Standish', 'Shevington',
            'Abram', 'Appley Bridge', 'Aspull', 'Billinge', 'Bryn', 'Burscough',
            'Dalton', 'Golborne', 'Haigh', 'Hindley Green', 'Ince', 'Leigh',
            'Lowton', 'Newton-le-Willows', 'Orrell', 'Parbold', 'Pemberton', 'Platt Bridge',
            'Shevington', 'Standish', 'Tyldesley', 'Up Holland', 'Whelley', 'Winstanley'
        ]
    },
    {
        county: 'Lancashire (Preston & West)',
        postcodePrefixes: ['PR', 'LA1', 'LA2', 'LA3', 'LA4', 'LA5'],
        towns: [
            'Preston', 'Chorley', 'Leyland', 'Ormskirk', 'Skelmersdale', 'Longridge',
            'Garstang', 'Kirkham', 'Penwortham', 'Adlington', 'Croston', 'Eccleston',
            'Euxton', 'Tarleton', 'Walton-le-Dale', 'Bamber Bridge', 'Bilsborrow', 'Brock',
            'Coppull', 'Freckleton', 'Goosnargh', 'Grimsargh', 'Hesketh Bank', 'Ingol',
            'Much Hoole', 'New Longton', 'Rufford', 'Samlesbury', 'Walmer Bridge', 'Whittle-le-Woods',
            'Appley Bridge', 'Ashton-on-Ribble', 'Barton', 'Bretherton', 'Brindle', 'Buckshaw Village',
            'Clayton-le-Woods', 'Cottam', 'Croston', 'Eccleston', 'Euxton', 'Farington',
            'Farington Moss', 'Fulwood', 'Goosnargh', 'Grimsargh', 'Hesketh Bank', 'Hoole',
            'Hutton', 'Ingol', 'Kirkham', 'Lea', 'Leyland', 'Longton', 'Lostock Hall',
            'Much Hoole', 'New Longton', 'Penwortham', 'Ribbleton', 'Rufford', 'Samlesbury',
            'Scarisbrick', 'Skelmersdale', 'Tarleton', 'Ulnes Walton', 'Walton-le-Dale',
            'Warton', 'Whittle-le-Woods'
        ]
    },
    {
        county: 'Lancashire (Blackburn & Burnley)',
        postcodePrefixes: ['BB'],
        towns: [
            'Blackburn', 'Burnley', 'Accrington', 'Nelson', 'Colne', 'Rossendale',
            'Darwen', 'Bacup', 'Clitheroe', 'Haslingden', 'Padiham', 'Rawtenstall',
            'Barnoldswick', 'Earby', 'Great Harwood', 'Rishton', 'Whitworth', 'Brierfield',
            'Clayton-le-Moors', 'Fence', 'Foulridge', 'Higher Walton', 'Langho', 'Mellor',
            'Oswaldtwistle', 'Read', 'Sabden', 'Trawden', 'Whalley', 'Wilpshire',
            'Altham', 'Appleton', 'Bacup', 'Barrowford', 'Blacko', 'Briercliffe',
            'Britannia', 'Burnley Wood', 'Chatburn', 'Cliviger', 'Coates', 'Colne',
            'Copster Green', 'Cornholme', 'Cowling', 'Crawshawbooth', 'Dunnockshaw',
            'Earby', 'Fence', 'Foulridge', 'Gibfield', 'Gisburn', 'Goodshaw', 'Great Harwood',
            'Grimshaw', 'Hapton', 'Helmshore', 'Higham', 'Huncoat', 'Ightenhill',
            'Kelbrook', 'Laneshaw Bridge', 'Langho', 'Loveclough', 'Lower Darwen',
            'Mellor', 'Nelson', 'Newchurch-in-Pendle', 'Old Langho', 'Oswaldtwistle',
            'Padiham', 'Pendle', 'Rawtenstall', 'Read', 'Reedley', 'Rishton',
            'Roughlee', 'Sabden', 'Shuttleworth', 'Skelton', 'Sough', 'Stacksteads',
            'Trawden', 'Trawden Forest', 'Waterfoot', 'Worsthorne', 'Wray'
        ]
    },
    {
        county: 'Lancashire (Fylde Coast)',
        postcodePrefixes: ['FY'],
        towns: [
            'Blackpool', 'Fleetwood', 'Lytham St Annes', 'Cleveleys', 'Poulton-le-Fylde',
            'Kirkham', 'Bispham', 'Carleton', 'Cleveleys', 'Freckleton',
            'Great Eccleston', 'Hambleton', 'Knott End-on-Sea', 'Layton', 'Marton',
            'Norbreck', 'Preesall', 'Singleton', 'Staining', 'Thornton-Cleveleys', 'Weeton',
            'Anchorsholme', 'Ardwick', 'Bispham', 'Blackpool Airport', 'Blackpool North',
            'Blackpool South', 'Breck', 'Carleton', 'Clifton', 'Cockerham', 'Cottam',
            'Esprick', 'Fairhaven', 'Fleetwood', 'Freckleton', 'Great Eccleston',
            'Hambleton', 'Hardhorn', 'Hawthorn', 'Ingol', 'Kirkham', 'Knott End-on-Sea',
            'Layton', 'Little Bispham', 'Little Carleton', 'Little Thornton', 'Lytham',
            'Marton', 'Moor Park', 'Mythop', 'Norbreck', 'Normoss', 'Over Wyre',
            'Poulton-le-Fylde', 'Preesall', 'Ribby', 'Singleton', 'Staining', 'St Annes-on-Sea',
            'St Michael\'s on Wyre', 'Thornton', 'Warton', 'Wesham', 'Wrea Green'
        ]
    },
    {
        county: 'Merseyside (Liverpool City & North)',
        postcodePrefixes: ['L'],
        towns: [
            'Liverpool', 'Bootle', 'Crosby', 'Kirkby', 'Maghull', 'Prescot',
            'Huyton', 'Knowsley', 'Litherland', 'Melling', 'Newton-le-Willows', 'Rainford',
            'Rainhill', 'St Helens', 'Southport', 'Formby', 'Aintree', 'Childwall', 'Fazakerley',
            'Garston', 'Toxteth', 'Wavertree', 'Woolton', 'Allerton', 'Anfield', 'Belle Vale',
            'Broadgreen', 'Clubmoor', 'Croxteth', 'Everton', 'Halewood', 'Kensington', 'Mossley Hill',
            'Norris Green', 'Old Swan', 'Page Moss', 'Speke', 'Walton', 'West Derby',
            'Aigburth', 'Anfield', 'Belle Vale', 'Broadgreen', 'Childwall', 'Clubmoor',
            'Croxteth', 'Dingle', 'Everton', 'Fazakerley', 'Garston', 'Gateacre',
            'Grassendale', 'Hunts Cross', 'Kensington', 'Lark Lane', 'Litherland',
            'Mossley Hill', 'Netherley', 'Norris Green', 'Old Swan', 'Orrell Park',
            'Page Moss', 'Princes Park', 'Sefton Park', 'Speke', 'Stoneycroft', 'Toxteth',
            'Tuebrook', 'Wavertree', 'West Derby', 'Woolton'
        ]
    },
    {
        county: 'Merseyside (Wirral)',
        postcodePrefixes: ['CH41', 'CH42', 'CH43', 'CH44', 'CH45', 'CH46', 'CH47', 'CH48', 'CH49', 'CH60', 'CH61', 'CH62', 'CH63', 'CH64'],
        towns: [
            'Birkenhead', 'Wallasey', 'Heswall', 'Bebington', 'Bromborough', 'Moreton',
            'West Kirby', 'Greasby', 'Hoylake', 'Meols', 'New Brighton', 'Prenton', 'Upton',
            'Bidston', 'Claughton', 'Eastham', 'Frankby', 'Gayton', 'Irby', 'Leasowe',
            'Neston', 'Oxton', 'Pensby', 'Port Sunlight', 'Rock Ferry', 'Seacombe',
            'Spital', 'Thurstaston', 'Tranmere', 'Wallasey Village', 'Woodchurch',
            'Arrowe Park', 'Barnston', 'Bebington', 'Bidston', 'Birkenhead', 'Bromborough',
            'Caldy', 'Clatterbridge', 'Claughton', 'Eastham', 'Frankby', 'Gayton',
            'Greasby', 'Heswall', 'Hoylake', 'Irby', 'Landican', 'Leasowe', 'Little Neston',
            'Meols', 'Moreton', 'New Brighton', 'New Ferry', 'Noctorum', 'Oxton',
            'Pensby', 'Prenton', 'Port Sunlight', 'Rock Ferry', 'Saughall Massie', 'Seacombe',
            'Spital', 'Storeton', 'Thingwall', 'Thurstaston', 'Tranmere', 'Upton',
            'Wallasey', 'West Kirby', 'Woodchurch', 'Woodside'
        ]
    },

    // --- WEST MIDLANDS ---
    {
        county: 'Herefordshire',
        postcodePrefixes: ['HR'],
        towns: [
            'Hereford', 'Leominster', 'Ross-on-Wye', 'Ledbury', 'Bromyard', 'Kington',
            'Fownhope', 'Much Wenlock', 'Pembridge', 'Weobley', 'Lugwardine', 'Mortimer Cross',
            'Orleton', 'Peterchurch', 'Wormbridge', 'Bishops Frome', 'Colwall', 'Eardisley',
            'Ewyas Harold', 'Garway', 'Goodrich', 'Hoarwithy', 'Kingstone', 'Longtown',
            'Marden', 'Moccas', 'Presteigne', 'Staunton-on-Wye', 'Tarrington',
            'Almeley', 'Ashperton', 'Aston Ingham', 'Bartestree', 'Bodenham', 'Brampton Bryan',
            'Bridge Sollers', 'Brimfield', 'Broad Oak', 'Burghill', 'Canon Pyon', 'Clifford',
            'Cradley', 'Credenhill', 'Dilwyn', 'Docklow', 'Dulas', 'Eardisland',
            'Eastnor', 'Eaton Bishop', 'Fownhope', 'Garway', 'Goodrich', 'Gorsley',
            'Grendon Bishop', 'Hampton Bishop', 'Hope under Dinmore', 'Kenchester',
            'Kingsland', 'Kinnersley', 'Lingen', 'Little Marcle', 'Longtown', 'Lugwardine',
            'Luston', 'Madley', 'Mansel Lacy', 'Marden', 'Marstow', 'Monkland', 'Much Birch',
            'Norton Canon', 'Orleton', 'Pembridge', 'Pencombe', 'Peterchurch', 'Pixley',
            'Putley', 'Richards Castle', 'Skenfrith', 'St Devereux', 'St Weonards',
            'Stoke Edith', 'Stretton Sugwas', 'Sutton St Nicholas', 'Symonds Yat',
            'Tarrington', 'Tyberton', 'Ullingswick', 'Walford', 'Wellington', 'Whitney-on-Wye',
            'Wigmore', 'Withington', 'Woolhope', 'Yarpole'
        ]
    },
    {
        county: 'Shropshire (Shrewsbury & North)',
        postcodePrefixes: ['SY', 'TF1', 'TF2', 'TF3', 'TF4', 'TF5', 'TF6'],
        towns: [
            'Shrewsbury', 'Oswestry', 'Whitchurch', 'Market Drayton', 'Wem', 'Church Stretton',
            'Baschurch', 'Bayston Hill', 'Bomere Heath', 'Broseley', 'Condover', 'Craven Arms',
            'Ellesmere', 'Hodnet', 'Minsterley', 'Much Wenlock', 'Pontesbury', 'Prees',
            'Shawbury', 'Shifnal', 'Wellington', 'Acton Burnell', 'Albrighton', 'Alveley',
            'Atcham', 'Audlem', 'Baschurch', 'Bayston Hill', 'Bicton Heath', 'Bomere Heath',
            'Broseley', 'Buildwas', 'Cardington', 'Cheswardine', 'Chirbury', 'Church Pulverbatch',
            'Clun', 'Cockshutt', 'Condover', 'Cressage', 'Cross Houses', 'Crudgington',
            'Culmington', 'Ditton Priors', 'Donnington', 'Dorrington', 'Edgmond', 'Ellesmere',
            'Ford', 'Gobowen', 'Hadnall', 'Highley', 'Hodnet', 'Ironbridge',
            'Kemberton', 'Kinnerley', 'Knockin', 'Leebotwood', 'Little Wenlock', 'Longden',
            'Longnor', 'Lydbury North', 'Madeley', 'Maesbrook', 'Maesbury', 'Market Drayton',
            'Minsterley', 'Montford Bridge', 'Moreton Corbet', 'Much Wenlock', 'Myddle',
            'Nash', 'Nesscliffe', 'Newport', 'Oakengates', 'Pant', 'Prees', 'Pulverbatch',
            'Queen\'s Head', 'Ruyton-XI-Towns', 'Selattyn', 'Shawbury', 'Shifnal',
            'St Martins', 'Stiperstones', 'Stoke on Tern', 'Tibberton', 'Tilstock',
            'Tong', 'Walford', 'Wellington', 'Wem', 'Westbury', 'Whitchurch', 'Whittington',
            'Woore', 'Wrockwardine Wood'
        ]
    },
    {
        county: 'Shropshire (Telford & South)',
        postcodePrefixes: ['TF7', 'TF8', 'TF9', 'TF10', 'TF11', 'TF12', 'TF13'],
        towns: [
            'Telford', 'Bridgnorth', 'Ludlow', 'Newport', 'Broseley', 'Ironbridge',
            'Madeley', 'Oakengates', 'Shifnal', 'Wellington', 'Dawley', 'Donnington',
            'Hadley', 'Ketley', 'Lawley', 'Leegomery', 'Malinslee', 'Muxton', 'St Georges',
            'Stirchley', 'Sutton Hill', 'Woodside', 'Albrighton', 'Bishops Castle', 'Broseley',
            'Burford', 'Cardington', 'Clee Hill', 'Cleobury Mortimer', 'Clun', 'Coalbrookdale',
            'Craven Arms', 'Ditton Priors', 'Donnington', 'Dorrington', 'Eardington', 'Easthope',
            'Eaton Constantine', 'Edgmond', 'Ellesmere', 'Highley', 'Hodnet', 'Ironbridge',
            'Kemberton', 'Kinnerley', 'Knockin', 'Leebotwood', 'Little Wenlock', 'Longden',
            'Longnor', 'Lydbury North', 'Madeley', 'Maesbrook', 'Maesbury', 'Market Drayton',
            'Minsterley', 'Montford Bridge', 'Moreton Corbet', 'Much Wenlock', 'Myddle',
            'Nash', 'Nesscliffe', 'Newport', 'Oakengates', 'Pant', 'Prees', 'Pulverbatch',
            'Queen\'s Head', 'Ruyton-XI-Towns', 'Selattyn', 'Shawbury', 'Shifnal',
            'St Martins', 'Stiperstones', 'Stoke on Tern', 'Tibberton', 'Tilstock',
            'Tong', 'Walford', 'Wellington', 'Wem', 'Westbury', 'Whitchurch', 'Whittington',
            'Woore', 'Wrockwardine Wood'
        ]
    },
    {
        county: 'Staffordshire (North)',
        postcodePrefixes: ['ST'],
        towns: [
            'Stoke-on-Trent', 'Newcastle-under-Lyme', 'Kidsgrove', 'Leek', 'Stone', 'Biddulph',
            'Cheadle', 'Eccleshall', 'Endon', 'Fenton', 'Hanley', 'Longton',
            'Madeley', 'Penkhull', 'Silverdale', 'Smallthorne', 'Tunstall', 'Audley',
            'Burslem', 'Cobridge', 'Dresden', 'Etruria', 'Fenton', 'Fenton Manor', 'Fenton Park',
            'Florence', 'Goldenhill', 'Hartshill', 'Longton', 'Meir', 'Milton', 'Newchapel',
            'Packmoor', 'Smallthorne', 'Sneyd Green', 'Trentham', 'Tunstall',
            'Abbey Hulton', 'Adderley Green', 'Baddeley Green', 'Baldwins Gate', 'Basford',
            'Bignall End', 'Blurton', 'Bradwell', 'Burslem', 'Butt Lane', 'Caverswall',
            'Chell', 'Clayton', 'Cliffe Vale', 'Cobridge', 'Consall', 'Crackley',
            'Dilhorne', 'Draycott', 'Endon', 'Etruria', 'Fenton', 'Fenton Manor', 'Fenton Park',
            'Florence', 'Fowlea', 'Goldenhill', 'Great Bridgeford', 'Hanchurch', 'Hanley',
            'Harriseahead', 'Hartshill', 'Kidsgrove', 'Lightwood', 'Longport', 'Longton',
            'Madeley', 'May Bank', 'Meir', 'Meir Heath', 'Milton', 'Newchapel', 'Normacot',
            'Norton Green', 'Oakhill', 'Packmoor', 'Penkhull', 'Porthill', 'Red Street',
            'Rode Heath', 'Sandford Hill', 'Scot Hay', 'Shelton', 'Silverdale', 'Smallthorne',
            'Sneyd Green', 'Stoke', 'Swynnerton', 'Talke', 'Talke Pits', 'Trentham',
            'Tunstall', 'Weston Coyney', 'Wetley Rocks', 'Whitmore', 'Woore'
        ]
    },
    {
        county: 'Staffordshire (South East)',
        postcodePrefixes: ['WS', 'DE13', 'DE14', 'DE15'],
        towns: [
            'Walsall', 'Lichfield', 'Cannock', 'Hednesford', 'Burntwood', 'Aldridge',
            'Brownhills', 'Great Wyrley', 'Norton Canes', 'Pelsall', 'Shenstone', 'Willenhall',
            'Burton upon Trent', 'Uttoxeter', 'Abbots Bromley', 'Alrewas', 'Barton-under-Needwood',
            'Brewood', 'Cheslyn Hay', 'Croxall', 'Fazeley', 'Fradley', 'Gnosall', 'Handsacre',
            'Hoar Cross', 'Kings Bromley', 'Longdon', 'Marchington', 'Needwood', 'Newborough',
            'Rolleston on Dove', 'Stretton', 'Tutbury', 'Yoxall',
            'Armitage', 'Bescot', 'Bloxwich', 'Brownhills Common', 'Burntwood', 'Cannock Wood',
            'Chasetown', 'Chasewater', 'Clayhanger', 'Coton Green', 'Dosthill', 'Drayton Bassett',
            'Farewell', 'Hammerwich', 'Handsacre', 'Hatherton', 'Heath Hayes', 'High Heath',
            'Hill Ridware', 'Hints', 'Kings Standing', 'Leamore', 'Little Aston', 'Longdon Green',
            'Muckley Corner', 'Ogley Hay', 'Pelsall Wood', 'Pipehill', 'Pleck', 'Pye Green',
            'Rawnsley', 'Rugeley', 'Rushall', 'Shenstone Woodend', 'Slitting Mill', 'Stonnall',
            'Streetly', 'Stubber\'s Green', 'Wall', 'Walsall Wood', 'Weeford', 'Whittington',
            'Wigginton', 'Wilnecote', 'Wood End'
        ]
    },
    {
        county: 'Staffordshire (South West)',
        postcodePrefixes: ['ST16', 'ST17', 'ST18', 'ST19', 'ST20', 'ST21'],
        towns: [
            'Stafford', 'Rugeley', 'Penkridge', 'Eccleshall', 'Gnosall',
            'Haughton', 'Milford', 'Stone', 'Great Bridgeford', 'Little Haywood',
            'Colwich', 'Brocton', 'Castle Church', 'Doxey', 'Seighford', 'Weeping Cross',
            'Acton Trussell', 'Adbaston', 'Aqualate', 'Bradley', 'Brocton', 'Burton Manor',
            'Cannock Chase', 'Castle Church', 'Chebsey', 'Church Eaton', 'Coppenhall',
            'Coton Clanford', 'Creswell', 'Doxey', 'Dunston', 'Eccleshall', 'Enson',
            'Farewell', 'Forton', 'Fradswell', 'Fulford', 'Gayton', 'Great Bridgeford',
            'Haughton', 'High Offley', 'Hixon', 'Hixon Airfield', 'Hopton', 'Ingestre',
            'Keele', 'Knighton', 'Lapley', 'Little Haywood', 'Longford', 'Maer',
            'Marston', 'Milford', 'Moreton', 'Norbury', 'Oulton', 'Parkside',
            'Pattingham', 'Penkridge', 'Ranton', 'Salt', 'Sandon', 'Seighford',
            'Shugborough', 'Stoke-on-Trent', 'Stone', 'Swynnerton', 'Tixall', 'Walton-on-the-Hill',
            'Weeping Cross', 'Weston', 'Whitgreave', 'Woodseaves'
        ]
    },
    {
        county: 'Warwickshire (North & East)',
        postcodePrefixes: ['CV1', 'CV2', 'CV3', 'CV4', 'CV5', 'CV6', 'CV7', 'CV8', 'CV9', 'CV10', 'CV11', 'CV12', 'CV13'],
        towns: [
            'Coventry', 'Nuneaton', 'Rugby', 'Bedworth', 'Atherstone', 'Coleshill',
            'Bulkington', 'Keresley', 'Long Lawford', 'Ryton-on-Dunsmore', 'Binley',
            'Brandon', 'Brinklow', 'Burton Hastings', 'Clifton upon Dunsmore', 'Exhall',
            'Foleshill', 'Keresley', 'Longford', 'Potters Green', 'Willenhall',
            'Wolston', 'Wyken', 'Allesley', 'Ansty', 'Arley', 'Ash Green', 'Barnacle',
            'Barston', 'Berkswell', 'Binley Woods', 'Bourton-on-Dunsmore', 'Brandon',
            'Bretford', 'Bubbenhall', 'Burton Green', 'Canley', 'Catthorpe', 'Church Lawford',
            'Clifton upon Dunsmore', 'Combe Fields', 'Copston Magna', 'Corley', 'Coton',
            'Coundon', 'Earlsdon', 'Eastern Green', 'Exhall', 'Fillongley', 'Foleshill',
            'Frankton', 'Galley Common', 'Goodyers End', 'Great Heath', 'Griff', 'Hawkesbury',
            'Hillmorton', 'Keresley End', 'Kilsby', 'Kings Newnham', 'Longford', 'Long Lawford',
            'Monks Kirby', 'New Arley', 'Newbold-on-Avon', 'Old Arley', 'Oldbury', 'Pailton',
            'Potters Green', 'Radford', 'Radford Semele', 'Shilton', 'Smite', 'Southam',
            'Stretton-on-Dunsmore', 'Stretton-under-Fosse', 'Thurlaston', 'Ullesthorpe',
            'Upper Eastern Green', 'Walsgrave-on-Sowe', 'Westwood Heath', 'Whitley', 'Withybrook',
            'Wolston', 'Wood End', 'Wyken'
        ]
    },
    {
        county: 'Warwickshire (South & West)',
        postcodePrefixes: ['CV21', 'CV22', 'CV23', 'CV31', 'CV32', 'CV33', 'CV34', 'CV35', 'CV36', 'CV37', 'CV47'],
        towns: [
            'Leamington Spa', 'Warwick', 'Stratford-upon-Avon', 'Kenilworth', 'Alcester',
            'Southam', 'Shipston-on-Stour', 'Bidford-on-Avon', 'Polesworth', 'Studley',
            'Whitnash', 'Barford', 'Bishop\'s Tachbrook', 'Claverdon', 'Cubbington',
            'Ettington', 'Fenny Compton', 'Gaydon', 'Harbury', 'Kineton', 'Lapworth',
            'Moreton Morrell', 'Napton-on-the-Hill', 'Pillerton Hersey', 'Radford Semele',
            'Snitterfield', 'Tanworth-in-Arden', 'Tysoe', 'Wellesbourne', 'Wootton Wawen',
            'Admington', 'Alderminster', 'Ardens Grafton', 'Armscote', 'Ashorne', 'Aston Cantlow',
            'Avon Dassett', 'Barford', 'Barton-on-the-Heath', 'Bearley', 'Bishops Itchington',
            'Blackdown', 'Brailes', 'Bretforton', 'Broom', 'Burton Dassett', 'Chadshunt',
            'Charlecote', 'Cherington', 'Chesterton', 'Claverdon', 'Clifford Chambers',
            'Combrook', 'Compton Verney', 'Compton Wynyates', 'Coughton', 'Darlingscott',
            'Dorsington', 'Ettington', 'Exhall', 'Farnborough', 'Fenny Compton', 'Flecknoe',
            'Fulbrook', 'Gaydon', 'Great Alne', 'Great Wolford', 'Halford', 'Hampton Lucy',
            'Harbury', 'Haselor', 'Hatton', 'Honington', 'Ilmington', 'Kineton', 'Ladbroke',
            'Lighthorne', 'Little Compton', 'Long Compton', 'Long Itchington', 'Lower Quinton',
            'Lower Shuckburgh', 'Lower Tysoe', 'Luddington', 'Mappleborough Green', 'Marlcliff',
            'Marton', 'Middle Tysoe', 'Moreton Morrell', 'Napton-on-the-Hill', 'Newbold Pacey',
            'Norton Lindsey', 'Oxhill', 'Pillerton Hersey', 'Pillerton Priors', 'Preston on Stour',
            'Priors Marston', 'Priors Hardwick', 'Radford Semele', 'Salford Priors', 'Sambourne',
            'Shipston-on-Stour', 'Shotteswell', 'Snitterfield', 'Southam', 'Stockton', 'Stourton',
            'Stratford-upon-Avon', 'Studley', 'Tanworth-in-Arden', 'Temple Grafton', 'Thornton',
            'Tredington', 'Tysoe', 'Ullenhall', 'Upper Quinton', 'Upper Shuckburgh', 'Upper Tysoe',
            'Warmington', 'Wellesbourne', 'Whichford', 'Whitchurch', 'Wixford', 'Wolfhampcote',
            'Wootton Wawen'
        ]
    },
    {
        county: 'West Midlands (Birmingham City & East)',
        postcodePrefixes: ['B'],
        towns: [
            'Birmingham City Centre', 'Solihull', 'Sutton Coldfield', 'Acocks Green', 'Aston',
            'Balsall Heath', 'Castle Bromwich', 'Chelmsley Wood', 'Coleshill', 'Dorridge',
            'Erdington', 'Handsworth', 'Harborne', 'Kings Heath', 'Kingstanding', 'Northfield',
            'Perry Barr', 'Shirley', 'Stechford', 'Yardley', 'Alum Rock', 'Bartley Green',
            'Billesley', 'Bournville', 'Bromford', 'Cotteridge', 'Druids Heath', 'Edgbaston',
            'Frankley', 'Great Barr', 'Hall Green', 'Hodge Hill', 'Kings Norton', 'Ladywood',
            'Longbridge', 'Moseley', 'Nechells', 'New Oscott', 'Olton', 'Quinton', 'Rubery',
            'Selly Oak', 'Sheldon', 'Small Heath', 'Sparkbrook', 'Sparkhill', 'Stechford',
            'Tyseley', 'Ward End', 'Washwood Heath', 'Weoley Castle', 'Wythall',
            'Adderley Park', 'Alum Rock', 'Aston', 'Balsall Heath', 'Bartley Green', 'Bearwood',
            'Birches Green', 'Bordesley Green', 'Bournville', 'Brandwood', 'Bromford',
            'Castle Vale', 'Chad Valley', 'Cofton Hackett', 'Digbeth', 'Druids Heath',
            'Edgbaston', 'Erdington', 'Five Ways', 'Frankley', 'Garetts Green', 'Gib Heath',
            'Gravelly Hill', 'Great Barr', 'Hall Green', 'Handsworth Wood', 'Harborne',
            'Highgate', 'Hodge Hill', 'Jewellery Quarter', 'Kings Heath', 'Kings Norton',
            'Kingstanding', 'Kitts Green', 'Ladywood', 'Lea Hall', 'Longbridge', 'Lozells',
            'Mappleborough Green', 'Maypole', 'Minworth', 'Moseley', 'Nechells', 'New Oscott',
            'Northfield', 'Oldbury', 'Olton', 'Perry Barr', 'Pype Hayes', 'Quinton',
            'Rednal', 'Rubery', 'Saltley', 'Selly Oak', 'Selly Park', 'Shard End',
            'Sheldon', 'Shirley', 'Small Heath', 'Soho', 'Sparkbrook', 'Sparkhill',
            'Stechford', 'Stirchley', 'Sutton Coldfield', 'Tile Cross', 'Tyseley',
            'Vauxhall', 'Wake Green', 'Walmley', 'Ward End', 'Warstock', 'Washwood Heath',
            'Weoley Castle', 'West Heath', 'Whitehouse Common', 'Witton', 'Woodgate',
            'Wythall', 'Yardley Wood'
        ]
    },
    {
        county: 'West Midlands (Black Country North)',
        postcodePrefixes: ['DY1', 'DY2', 'DY3', 'DY4', 'DY5', 'WS1', 'WS2', 'WS3', 'WS4', 'WS5', 'WS6', 'WS7', 'WS8', 'WS9', 'WS10'],
        towns: [
            'Walsall', 'Dudley', 'Tipton', 'Willenhall', 'Bilston', 'Bloxwich',
            'Coseley', 'Darlaston', 'Great Barr', 'Aldridge', 'Brownhills',
            'Cannock', 'Cheslyn Hay', 'Essington', 'Great Wyrley', 'Hednesford',
            'Norton Canes', 'Pelsall', 'Rushall', 'Shelfield', 'Streetly', 'Wednesbury',
            'Wednesfield', 'Walsall Wood', 'Barr Beacon', 'Bentley', 'Birchills',
            'Leamore', 'Pleck', 'Reedswood', 'Short Heath', 'Willenhall',
            'Ashmore Park', 'Bentley Heath', 'Bilston', 'Bloxwich', 'Bradley', 'Brownhills',
            'Bushbury', 'Cannock', 'Cheslyn Hay', 'Clayhanger', 'Coseley', 'Darlaston',
            'Essington', 'Featherstone', 'Fordhouses', 'Great Wyrley', 'Heath Town',
            'Hednesford', 'Landywood', 'Lane Head', 'Leamore', 'Little Bloxwich', 'New Invention',
            'New Cross', 'Norton Canes', 'Oxley', 'Pelsall', 'Pendeford', 'Pleck',
            'Portobello', 'Pye Green', 'Rushall', 'Ryecroft', 'Shelfield', 'Short Heath',
            'Springfield', 'Stonnall', 'Streetly', 'Stubber\'s Green', 'Tettenhall',
            'Wednesbury', 'Wednesfield', 'Willenhall', 'Wood End'
        ]
    },
    {
        county: 'West Midlands (Black Country South & West)',
        postcodePrefixes: ['DY6', 'DY7', 'DY8', 'DY9', 'DY10', 'DY11', 'DY12', 'WV1', 'WV2', 'WV3', 'WV4', 'WV5', 'WV6', 'WV7', 'WV8', 'WV9', 'WV10', 'WV11', 'WV12', 'WV13', 'WV14'],
        towns: [
            'Wolverhampton', 'Stourbridge', 'Halesowen', 'Brierley Hill', 'Cradley Heath',
            'Kingswinford', 'Oldbury', 'Rowley Regis', 'Smethwick', 'Tettenhall',
            'Wednesbury', 'Bewdley', 'Kidderminster', 'Stourport-on-Severn', 'Amblecote',
            'Blackheath', 'Blakenhall', 'Bradmore', 'Bushbury', 'Codsall', 'Compton',
            'Cosford', 'Dudley', 'Enville', 'Gornal Wood', 'Himley', 'Lower Gornal',
            'Pattingham', 'Penn', 'Perton', 'Sedgley', 'Tettenhall Wood', 'Upper Gornal',
            'Wombourne', 'Albion', 'Amblecote', 'Ashwood Park', 'Bilston', 'Blakenhall',
            'Bradley', 'Bushbury', 'Castlecroft', 'Codsall', 'Compton', 'Coseley',
            'Coven', 'Deepfields', 'Dudley Port', 'Ettingshall', 'Finchfield', 'Gornal',
            'Gospel End', 'Graiseley', 'Great Bridge', 'Himley', 'Horseley Heath', 'Kingswinford',
            'Lanesfield', 'Lower Penn', 'Merridale', 'Newbridge', 'Oldbury', 'Oxley',
            'Parkfields', 'Pattingham', 'Penn Fields', 'Perton', 'Princes End', 'Queen\'s Cross',
            'Rough Hills', 'Sedgley', 'Spring Vale', 'Tettenhall', 'Tettenhall Wood', 'Tividale',
            'Upper Gornal', 'Wall Heath', 'Wednesfield', 'West Bromwich', 'Willenhall',
            'Wombourne', 'Woodsetton', 'Wordsley'
        ]
    },
    {
        county: 'Worcestershire',
        postcodePrefixes: ['WR'],
        towns: [
            'Worcester', 'Malvern', 'Evesham', 'Droitwich Spa', 'Pershore', 'Upton-upon-Severn',
            'Broadway', 'Catshill', 'Hagley', 'Tenbury Wells', 'Alvechurch', 'Belbroughton',
            'Clent', 'Cookhill', 'Feckenham', 'Inkberrow', 'Ombersley', 'Studley',
            'Abberley', 'Astwood Bank', 'Batchley', 'Bredon', 'Bromsgrove', 'Crowle',
            'Defford', 'Dodford', 'Fernhill Heath', 'Fladbury', 'Hanley Swan', 'Hartlebury',
            'Inkberrow', 'Kempsey', 'Littleworth', 'North Claines', 'Offenham', 'Pinvin',
            'Powick', 'Redditch', 'Rushwick', 'Salwarpe', 'Tibberton', 'Wychbold',
            'Abberton', 'Alfrick', 'Ashton under Hill', 'Astley', 'Bayton', 'Beckford',
            'Berrow', 'Besford', 'Bishampton', 'Blackminster', 'Bockleton', 'Bredon',
            'Bretforton', 'Broughton Hackett', 'Bushley', 'Castlemorton', 'Chaceley',
            'Church Lench', 'Cleeve Prior', 'Clifton upon Teme', 'Comberton', 'Conderton',
            'Cropthorne', 'Crowle', 'Defford', 'Doddenham', 'Drakes Broughton', 'Dudley',
            'Earls Croome', 'Eckington', 'Elmley Castle', 'Elmley Lovett', 'Evesham',
            'Feckenham', 'Fernhill Heath', 'Fladbury', 'Flyford Flavell', 'Great Witley',
            'Grimley', 'Hallow', 'Hanley Castle', 'Hanley Swan', 'Harvington', 'Hill Croome',
            'Hill and Moor', 'Holt Heath', 'Inkberrow', 'Kempsey', 'Kidderminster', 'Kington',
            'Knightwick', 'Leigh Sinton', 'Little Comberton', 'Little Witley', 'Longdon',
            'Lower Broadheath', 'Lower Moor', 'Lower Sapey', 'Madresfield', 'Malvern Link',
            'Malvern Wells', 'Mamble', 'Martley', 'Naunton Beauchamp', 'Newland', 'North Piddle',
            'Norton', 'Oddingley', 'Oldbury', 'Ombersley', 'Overbury', 'Peopleton',
            'Pershore', 'Pinvin', 'Powick', 'Queenhill', 'Ripple', 'Rochford', 'Rushwick',
            'Salford Priors', 'Severn Stoke', 'Shelsley Beauchamp', 'Shelsley Walsh',
            'South Littleton', 'Spetchley', 'Stanford on Teme', 'Stoulton', 'Stourport-on-Severn',
            'Strensham', 'Suckley', 'Tenbury Wells', 'Throckmorton', 'Tibberton', 'Upton Snodsbury',
            'Welland', 'White Ladies Aston', 'Whittington', 'Wick', 'Wickhamford', 'Wichenford',
            'Wyre Piddle'
        ]
    },

    // --- YORKSHIRE AND THE HUMBER ---
    {
        county: 'East Riding of Yorkshire (Hull & East)',
        postcodePrefixes: ['HU'],
        towns: [
            'Hull', 'Beverley', 'Hornsea', 'Withernsea', 'Anlaby', 'Brough',
            'Cottingham', 'Hedon', 'Hessle', 'Kirk Ella', 'North Ferriby', 'Swanland',
            'Willerby', 'Aldbrough', 'Bilton', 'Brandesburton', 'Burstwick', 'Keyingham',
            'Leven', 'Long Riston', 'Mappleton', 'Paull', 'Preston', 'Sproatley', 'Sutton-on-Hull',
            'Walkington', 'Wetwang', 'Aldbrough', 'Anlaby Common', 'Arram', 'Atwick', 'Baythorpe',
            'Beeford', 'Bishop Burton', 'Brandesburton', 'Burton Agnes', 'Burton Constable',
            'Camerton', 'Cherry Burton', 'Coniston', 'Cottingham', 'Dalton', 'Easington',
            'East Cottingwith', 'Ellerker', 'Elloughton', 'Etton', 'Flamborough', 'Foston on the Wolds',
            'Fraisthorpe', 'Ganstead', 'Gembling', 'Goxhill', 'Great Cowden', 'Great Driffield',
            'Great Hatfield', 'Great Kelk', 'Haisthorpe', 'Hessle', 'High Hunsley', 'Holmpton',
            'Hornsea', 'Hotham', 'Keyingham', 'Kilham', 'Kirkburn', 'Leconfield', 'Leven',
            'Little Weighton', 'Long Riston', 'Lund', 'Mappleton', 'Market Weighton', 'Meaux',
            'Melton', 'Middleton on the Wolds', 'Newbald', 'North Cave', 'North Dalton',
            'North Ferriby', 'Nunburnholme', 'Ottringham', 'Patrington', 'Paull', 'Pocklington',
            'Preston', 'Rise', 'Routh', 'Rowley', 'Sancton', 'Sigglesthorne', 'Skidby',
            'Skipsea', 'Skirlaugh', 'South Cave', 'South Dalton', 'Sproatley', 'Swanland',
            'Swine', 'Sutton-on-Hull', 'Tickton', 'Walkington', 'Wansford', 'Watton',
            'Weedley', 'Welton', 'Wetwang', 'Wilberfoss', 'Willerby', 'Withernwick', 'Woodmansey'
        ]
    },
    {
        county: 'East Riding of Yorkshire (West & Goole)',
        postcodePrefixes: ['DN14', 'YO8'],
        towns: [
            'Goole', 'Market Weighton', 'Pocklington', 'Howden', 'Snaith', 'Gilberdyke',
            'Airmyn', 'Barlby', 'Bubwith', 'Carlton', 'Drax', 'Eggborough', 'Hemingbrough',
            'Kellington', 'Pollington', 'Rawcliffe', 'Riccall', 'Sherburn-in-Elmet',
            'South Cave', 'Wressle', 'Asselby', 'Barmby on the Marsh', 'Blacktoft', 'Bubwith',
            'Camblesforth', 'Carlton', 'Cliffe', 'Cottingley', 'Eastrington', 'Eggborough',
            'Escrick', 'Foggathorpe', 'Garthorpe', 'Gilberdyke', 'Gowdall', 'Great Heck',
            'Green Oak', 'Hambleton', 'Hemingbrough', 'Hensall', 'Hook', 'Howden',
            'Kellington', 'Knottingley', 'Laxton', 'Little Weighton', 'Long Drax', 'Newport',
            'North Duffield', 'Osgodby', 'Pollington', 'Rawcliffe', 'Riccall', 'Ryther',
            'Skipwith', 'Snaith', 'South Duffield', 'Stillingfleet', 'Sutton on Derwent',
            'Thorganby', 'Thorpe Willoughby', 'Wressle'
        ]
    },
    {
        county: 'North Yorkshire (York City & East)',
        postcodePrefixes: ['YO1', 'YO10', 'YO19', 'YO23', 'YO24', 'YO26', 'YO30', 'YO31', 'YO32', 'YO41', 'YO42', 'YO43', 'YO51', 'YO60', 'YO61', 'YO62'],
        towns: [
            'York', 'Malton', 'Pickering', 'Helmsley', 'Easingwold', 'Tadcaster',
            'Acomb', 'Bishopthorpe', 'Copmanthorpe', 'Dunnington', 'Heslington', 'Haxby',
            'Strensall', 'Upper Poppleton', 'Boroughbridge', 'Hemsley', 'Kirkbymoorside', 'Pocklington',
            'Stamford Bridge', 'Sutton-on-the-Forest', 'Thirsk', 'Wigginton',
            'Acaster Malbis', 'Acaster Selby', 'Askham Bryan', 'Askham Richard', 'Barmby Moor',
            'Beningbrough', 'Bishopthorpe', 'Bolton Percy', 'Bossall', 'Bugthorpe', 'Claxton',
            'Copmanthorpe', 'Crayke', 'Dunnington', 'Easingwold', 'Elvington', 'Escrick',
            'Flaxton', 'Foston', 'Full Sutton', 'Gate Helmsley', 'Grimston', 'Haxby',
            'Helperby', 'Heslington', 'Heworth', 'Holgate', 'Holtby', 'Hovingham',
            'Huby', 'Huntington', 'Kexby', 'Kirk Hammerton', 'Knapton', 'Langtoft',
            'Lilling', 'Long Marston', 'Malton', 'Marton-in-the-Forest', 'Murton', 'Nether Poppleton',
            'Newton-on-Ouse', 'Nunnington', 'Osbaldwick', 'Oulston', 'Over Poppleton',
            'Pocklington', 'Raskelf', 'Riccall', 'Rillington', 'Sand Hutton', 'Sessay',
            'Sheriff Hutton', 'Skelton', 'Slingsby', 'Stamford Bridge', 'Stillingfleet',
            'Stockton-on-the-Forest', 'Strensall', 'Sutton-on-the-Forest', 'Terrington',
            'Tholthorpe', 'Tockwith', 'Tollerton', 'Upper Poppleton', 'Warthill', 'Wigginton',
            'Wistow', 'Yearsley'
        ]
    },
    {
        county: 'North Yorkshire (Harrogate & West)',
        postcodePrefixes: ['HG', 'LS21', 'LS22', 'LS23', 'LS24', 'LS29'],
        towns: [
            'Harrogate', 'Knaresborough', 'Ripon', 'Pateley Bridge', 'Boroughbridge',
            'Masham', 'Grassington', 'Starbeck', 'Birstwith', 'Burnt Yates',
            'Darley', 'Dacre', 'Follifoot', 'Green Hammerton', 'Killinghall', 'Kirkby Overblow',
            'Pannal', 'Spofforth', 'Summerbridge', 'Thruscross', 'Wetherby',
            'Addingham', 'Appleton Roebuck', 'Askwith', 'Bilton', 'Bishop Monkton',
            'Boston Spa', 'Bramham', 'Burley-in-Wharfedale', 'Burton Leonard', 'Calcutt',
            'Claro', 'Collingham', 'Cowthorpe', 'Darley', 'Denton', 'Dishforth',
            'Dunsforth', 'Farnham', 'Follifoot', 'Fountains Abbey', 'Goldsborough', 'Grantley',
            'Great Ouseburn', 'Green Hammerton', 'Harewood', 'Kirk Deighton', 'Kirkby Overblow',
            'Kirklington', 'Leathley', 'Little Ouseburn', 'Long Marston', 'Markington',
            'Marton-cum-Grafton', 'Middlethorpe', 'Nidd', 'North Deighton', 'Nun Monkton',
            'Pannal', 'Plumpton', 'Pool-in-Wharfedale', 'Ripley', 'Ripon', 'Roecliffe',
            'Sicklinghall', 'Spofforth', 'Staveley', 'Summerbridge', 'Thorp Arch',
            'Thruscross', 'Tockwith', 'Walkingham', 'Weeton', 'West Tanfield', 'Whixley'
        ]
    },
    {
        county: 'North Yorkshire (Coast & Moors)',
        postcodePrefixes: ['YO11', 'YO12', 'YO13', 'YO14', 'YO15', 'YO16', 'YO17', 'YO21', 'YO22'],
        towns: [
            'Scarborough', 'Whitby', 'Filey', 'Robin Hood\'s Bay', 'Staithes', 'Loftus',
            'Guisborough', 'Saltburn-by-the-Sea', 'Brotton', 'Castleton',
            'Danby', 'Egton', 'Grosmont', 'Hawsker', 'Hinderwell', 'Lythe', 'Runswick Bay',
            'Sandsend', 'Sleights', 'Snainton', 'Staxton', 'Wykeham',
            'Aislaby', 'Barmston', 'Brompton-by-Sawdon', 'Cayton', 'Cloughton', 'Cropton',
            'East Ayton', 'Ebberston', 'Fylingthorpe', 'Glaisdale', 'Goathland', 'Goldsborough',
            'Great Ayton', 'Grosmont', 'Hackness', 'Hawsker', 'Helmsley', 'Hinderwell',
            'Hunmanby', 'Kirkbymoorside', 'Levisham', 'Littlebeck', 'Lythe', 'Malton',
            'Mickleby', 'Middleton', 'Newton-on-Rawcliffe', 'Normanby', 'Osmotherley',
            'Pickering', 'Ravenscar', 'Robin Hood\'s Bay', 'Rosedale Abbey', 'Ruswarp',
            'Sandsend', 'Scalby', 'Seamer', 'Sinnington', 'Sleights', 'Snainton',
            'Staithes', 'Staxton', 'Thornton-le-Dale', 'Thwaite', 'Ugthorpe', 'West Ayton',
            'Westerdale', 'Whitby', 'Wilton', 'Wykeham'
        ]
    },
    {
        county: 'North Yorkshire (Dales & North West)',
        postcodePrefixes: ['DL8', 'DL11', 'LA10'],
        towns: [
            'Northallerton', 'Richmond', 'Leyburn', 'Hawes', 'Settle', 'Skipton',
            'Catterick Garrison', 'Bedale', 'Bainbridge', 'Grassington', 'Ingleton',
            'Kettlewell', 'Malham', 'Muker', 'Pateley Bridge', 'Reeth', 'Threshfield',
            'Appleton Wiske', 'Askrigg', 'Aysgarth', 'Barden', 'Barton', 'Bolton Abbey',
            'Brompton', 'Burton in Lonsdale', 'Carperby', 'Clapham', 'Conistone', 'Cowling',
            'Craven', 'Dalton', 'Dent', 'East Cowton', 'Eshton', 'Flasby', 'Follifoot',
            'Gargrave', 'Giggleswick', 'Great Ayton', 'Great Broughton', 'Great Smeaton',
            'Green Hammerton', 'Grinton', 'Hawes', 'Hebden', 'Hellifield', 'High Bentham',
            'Horton-in-Ribblesdale', 'Huby', 'Hunton', 'Kildwick', 'Kirkby Fleetham',
            'Kirkby Malzeard', 'Linton', 'Long Preston', 'Low Row', 'Lund', 'Malham',
            'Melsonby', 'Middleham', 'Muker', 'Newton-le-Willows', 'Patrick Brompton',
            'Pateley Bridge', 'Ramsgill', 'Redmire', 'Reeth', 'Richmond', 'Ripley',
            'Ripon', 'Romaldkirk', 'Sedbergh', 'Selside', 'Settle', 'Sheriff Hutton',
            'Skipton', 'Snape', 'Stainforth', 'Starbotton', 'Summerbridge', 'Swaledale',
            'Thirsk', 'Thornton-in-Lonsdale', 'Threshfield', 'Topcliffe', 'West Burton',
            'Wigglesworth', 'Winksley'
        ]
    },
    {
        county: 'South Yorkshire (Sheffield City)',
        postcodePrefixes: ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'S9', 'S10', 'S11', 'S12', 'S13', 'S14', 'S17'],
        towns: [
            'Sheffield City Centre', 'Dronfield', 'Chapeltown', 'Beighton', 'Ecclesfield',
            'Handsworth', 'Hillsborough', 'Mosborough', 'Stannington', 'Woodhouse', 'Attercliffe',
            'Crookes', 'Darnall', 'Dore', 'Firth Park', 'Gleadless', 'Grenoside', 'Halfway',
            'High Green', 'Hillsborough', 'Loxley', 'Manor', 'Meersbrook', 'Nether Edge',
            'Norton', 'Parson Cross', 'Ranmoor', 'Shiregreen', 'Stocksbridge', 'Totley',
            'Walkley', 'Wincobank', 'Arbourthorne', 'Attercliffe Common', 'Bents Green', 'Birley',
            'Bolsterstone', 'Bradway', 'Burncross', 'Catcliffe', 'Chapeltown', 'Concord',
            'Crookesmoor', 'Deepcar', 'Dore', 'Dronfield Woodhouse', 'Ecclesall', 'Ecclesfield',
            'Endcliffe', 'Firth Park', 'Fulwood', 'Gleadless Townend', 'Grenoside', 'Halfway',
            'Handsworth', 'Harthill', 'High Green', 'Hillsborough', 'Jordanthorpe', 'Loxley',
            'Malin Bridge', 'Manor Park', 'Meersbrook', 'Middlewood', 'Millhouses', 'Mosborough',
            'Nether Edge', 'Norton', 'Oughtibridge', 'Owlerton', 'Park Hill', 'Parson Cross',
            'Ranmoor', 'Richmond', 'Rivelin', 'Sharrow', 'Shirecliffe', 'Shiregreen',
            'Southey Green', 'Stannington', 'Stocksbridge', 'Tapton', 'Tinsley', 'Totley',
            'Upperthorpe', 'Walkley', 'Wadsley', 'Wadsley Bridge', 'Whirlow', 'Woodseats'
        ]
    },
    {
        county: 'South Yorkshire (Rotherham)',
        postcodePrefixes: ['S60', 'S61', 'S62', 'S63', 'S64', 'S65'],
        towns: [
            'Rotherham', 'Mexborough', 'Wombwell', 'Rawmarsh', 'Swallownest', 'Thrybergh',
            'Wickersley', 'Aston', 'Bramley', 'Catcliffe', 'Chapeltown', 'Dinnington',
            'Goldthorpe', 'Greasbrough', 'Hoyland', 'Kiveton Park', 'Maltby',
            'Parkgate', 'Rawmarsh', 'Thurcroft', 'Wath-upon-Dearne', 'Wentworth',
            'Anston', 'Aughton', 'Barlborough', 'Beighton', 'Blackburn', 'Brinsworth',
            'Broom', 'Broom Valley', 'Catcliffe', 'Clifton', 'Clowne', 'Dalton',
            'Eastwood', 'Firbeck', 'Greasbrough', 'Handsworth', 'Harley', 'Hellaby',
            'Hooton Roberts', 'Kilnhurst', 'Kimberworth', 'Laughton Common', 'Laughton-en-le-Morthen',
            'Leighton', 'Maltby', 'Manvers', 'Masbrough', 'Morthen', 'Ravenfield',
            'Rawmarsh', 'Rotherham', 'Scholes', 'South Anston', 'Swallownest', 'Thrybergh',
            'Treeton', 'Ulley', 'Wales', 'Wath-upon-Dearne', 'Wentworth', 'Whiston',
            'Wickersley', 'Woodhouse'
        ]
    },
    {
        county: 'South Yorkshire (Barnsley)',
        postcodePrefixes: ['S70', 'S71', 'S72', 'S73', 'S74', 'S75'],
        towns: [
            'Barnsley', 'Hoyland', 'Penistone', 'Wombwell', 'Cawthorne', 'Grimethorpe',
            'Goldthorpe', 'Kexbrough', 'Monk Bretton', 'Royston', 'Shafton', 'Staincross',
            'Thurnscoe', 'Worsbrough', 'Ardsley', 'Carlton', 'Cudworth', 'Darfield',
            'Elsecar', 'Great Houghton', 'Higham', 'Jump', 'Lundwood', 'Mapplewell',
            'Silkstone', 'Tankersley', 'Wombwell',
            'Barugh Green', 'Billingley', 'Bolton upon Dearne', 'Cawthorne', 'Clayton',
            'Cudworth', 'Darfield', 'Dodworth', 'Elsecar', 'Gawber', 'Goldthorpe',
            'Great Houghton', 'Grimethorpe', 'Higham', 'Hoyland Common', 'Hoyland Nether',
            'Jump', 'Kexbrough', 'Little Houghton', 'Lundwood', 'Mapplewell', 'Monk Bretton',
            'New Lodge', 'Oxspring', 'Pilley', 'Pogmoor', 'Royston', 'Shafton',
            'Silkstone', 'Staincross', 'Tankersley', 'Thurgoland', 'Thurnscoe',
            'Wath-upon-Dearne', 'Wombwell', 'Worsbrough Common', 'Worsbrough Dale'
        ]
    },
    {
        county: 'South Yorkshire (Doncaster)',
        postcodePrefixes: ['DN'],
        towns: [
            'Doncaster', 'Askern', 'Bawtry', 'Conisbrough', 'Edlington', 'Goldthorpe',
            'Mexborough', 'Stainforth', 'Thorne', 'Tickhill', 'Armthorpe', 'Balby',
            'Bentley', 'Cantley', 'Carcroft', 'Hatfield', 'Rossington', 'Woodlands',
            'Adwick-le-Street', 'Auckley', 'Barnby Dun', 'Blaxton', 'Braithwell', 'Campsall',
            'Clay Lane', 'Cusworth', 'Denaby Main', 'Finningley', 'Fishlake', 'Kirk Sandall',
            'Loversall', 'Marr', 'New Rossington', 'Owston Ferry', 'Sprotbrough', 'Stainton',
            'Sykehouse', 'Thorne', 'Wadworth', 'Wheatley', 'Warmsworth',
            'Arksey', 'Armthorpe', 'Askern', 'Austerfield', 'Balby', 'Barnby Dun',
            'Bentley', 'Blaxton', 'Braithwell', 'Campsall', 'Cantley', 'Carcroft',
            'Clay Lane', 'Conisbrough', 'Cusworth', 'Denaby Main', 'Edenthorpe', 'Edlington',
            'Finningley', 'Fishlake', 'Hatfield', 'Hickleton', 'Highfields', 'Kirk Sandall',
            'Loversall', 'Marr', 'Mexborough', 'New Rossington', 'Norton', 'Owston Ferry',
            'Rossington', 'Sprotbrough', 'Stainforth', 'Stainton', 'Sykehouse', 'Thorne',
            'Tickhill', 'Tudworth', 'Wadworth', 'Wheatley', 'Woodlands'
        ]
    },
    {
        county: 'West Yorkshire (Leeds City & North)',
        postcodePrefixes: ['LS1', 'LS2', 'LS3', 'LS4', 'LS5', 'LS6', 'LS7', 'LS8', 'LS16', 'LS17'],
        towns: [
            'Leeds City Centre', 'Headingley', 'Chapel Allerton', 'Roundhay', 'Adel', 'Alwoodley',
            'Moortown', 'Cookridge', 'Meanwood', 'Oakwood', 'Burley', 'Kirkstall',
            'Armley', 'Bramley', 'Farnley', 'Gildersome', 'Pudsey', 'Stanningley',
            'Woodhouse', 'Harehills', 'Gipton', 'Seacroft', 'Cross Gates', 'Halton',
            'Whinmoor', 'Collingham', 'East Keswick', 'Harewood', 'Scarcroft', 'Shadwell',
            'Adel', 'Alwoodley', 'Armley', 'Beckett Park', 'Bramley', 'Burley',
            'Chapel Allerton', 'Cookridge', 'Cross Gates', 'East End Park', 'Farnley',
            'Gipton', 'Harehills', 'Headingley', 'Holbeck', 'Holt Park', 'Hunslet',
            'Hyde Park', 'Killingbeck', 'Kirkstall', 'Lawnswood', 'Meanwood', 'Moortown',
            'Moor Grange', 'Oakwood', 'Otley', 'Potternewton', 'Pudsey', 'Rodley',
            'Roundhay', 'Scott Hall', 'Seacroft', 'Shadwell', 'Stanningley', 'Swarcliffe',
            'Thorpe Park', 'Weetwood', 'West Park', 'Whinmoor', 'Woodhouse'
        ]
    },
    {
        county: 'West Yorkshire (Leeds South & East)',
        postcodePrefixes: ['LS9', 'LS10', 'LS11', 'LS12', 'LS13', 'LS14', 'LS15', 'LS25', 'LS26', 'LS27', 'LS28'],
        towns: [
            'South Leeds', 'Beeston', 'Belle Isle', 'Middleton', 'Holbeck', 'Hunslet',
            'Rothwell', 'Garforth', 'Kippax', 'Methley', 'Woodlesford', 'Morley',
            'Drighlington', 'Gildersome', 'Tingley', 'Ardsley', 'East Ardsley',
            'Lofthouse', 'Outwood', 'Robin Hood', 'Stanley', 'Thorpe on the Hill',
            'Wakefield', 'Castleford', 'Pontefract', 'Knottingley',
            'Featherstone', 'Ackworth', 'Badsworth', 'Crofton', 'Darrington', 'Fitzwilliam',
            'Hemsworth', 'Kinsley', 'Moorthorpe', 'Ryhill', 'South Elmsall', 'South Kirkby',
            'Upton', 'Walton', 'Allerton Bywater', 'Altofts', 'Ardsley', 'Carlton',
            'Castleford', 'Crigglestone', 'Crofton', 'Darrington', 'East Ardsley',
            'Featherstone', 'Fitzwilliam', 'Ferry Fryston', 'Glasshoughton', 'Great Preston',
            'Hemsworth', 'Kinsley', 'Kippax', 'Kirk Smeaton', 'Knottingley', 'Ledston',
            'Ledsham', 'Lofthouse', 'Mickletown', 'Monk Fryston', 'Moorthorpe', 'Newmillerdam',
            'Normanton', 'Nostell', 'Notton', 'Ossett', 'Outwood', 'Overton', 'Pontefract',
            'Purston Jaglin', 'Ryhill', 'Sharlston', 'South Elmsall', 'South Kirkby',
            'South Milford', 'Stanley', 'Thorpe Audlin', 'Thorpe on the Hill', 'Upton',
            'Walton', 'Warmfield', 'West Bretton', 'West Garforth', 'Wintersett', 'Woolley'
        ]
    },
    {
        county: 'West Yorkshire (Bradford & Calderdale)',
        postcodePrefixes: ['BD', 'HX'],
        towns: [
            'Bradford', 'Halifax', 'Keighley', 'Shipley', 'Brighouse', 'Cleckheaton',
            'Hebden Bridge', 'Sowerby Bridge', 'Todmorden', 'Baildon', 'Bingley', 'Denholme',
            'Haworth', 'Idle', 'Low Moor', 'Queensbury', 'Steeton', 'Thornton', 'Wibsey',
            'Addingham', 'Burley-in-Wharfedale', 'Cottingley', 'Cullingworth', 'East Morton',
            'Eldwick', 'Frizinghall', 'Great Horton', 'Heaton', 'Liversedge',
            'Manningham', 'Oakworth', 'Oxenhope', 'Queensbury', 'Saltaire', 'Shelf',
            'Silsden', 'Thackley', 'Wibsey', 'Wilsden', 'Wyke',
            'Allerton', 'Baildon', 'Barkisland', 'Bingley', 'Blacko', 'Booth Wood',
            'Bradford Moor', 'Bramley', 'Burley Woodhead', 'Buttershaw', 'Calverley',
            'Cullingworth', 'Denholme', 'East Bierley', 'Eccleshill', 'Fairweather Green',
            'Farsley', 'Five Lane Ends', 'Frizinghall', 'Great Horton', 'Greengates',
            'Hainworth', 'Harden', 'Haworth', 'Heaton', 'Hipperholme', 'Holme Wood',
            'Idle', 'Illingworth', 'Lidget Green', 'Lightcliffe', 'Low Moor', 'Manningham',
            'Menston', 'Morton', 'Oakworth', 'Oxenhope', 'Queensbury', 'Riddlesden',
            'Saltaire', 'Shelf', 'Shipley', 'Silsden', 'Steeton', 'Thackley', 'Thornton',
            'Tong', 'Wibsey', 'Wilsden', 'Wyke'
        ]
    },
    {
        county: 'West Yorkshire (Huddersfield & Kirklees)',
        postcodePrefixes: ['HD'],
        towns: [
            'Huddersfield', 'Dewsbury', 'Batley', 'Holmfirth', 'Mirfield', 'Birstall',
            'Denby Dale', 'Heckmondwike', 'Kirkburton', 'Marsden', 'Meltham', 'Slaithwaite',
            'Almondbury', 'Birchencliffe', 'Brockholes', 'Clayton West', 'Dalton', 'Emley',
            'Fenay Bridge', 'Golcar', 'Honley', 'Kirkheaton', 'Lepton', 'Linthwaite',
            'Longwood', 'Milnsbridge', 'New Mill', 'Netherton', 'Outlane', 'Quarmby',
            'Scissett', 'Skelmanthorpe', 'Thongsbridge', 'Waterloo',
            'Batley Carr', 'Berry Brow', 'Birdsedge', 'Bradley', 'Brighouse', 'Burton Dean',
            'Churwell', 'Clayton West', 'Cowlersley', 'Crossland Moor', 'Dalton', 'Denby Dale',
            'Earlsheaton', 'Emley', 'Fixby', 'Flockton', 'Golcar', 'Gomersal',
            'Grange Moor', 'Hartshead', 'Heckmondwike', 'Honley', 'Huddersfield', 'Kirkburton',
            'Kirkheaton', 'Lepton', 'Linthwaite', 'Liversedge', 'Longwood', 'Lower Hopton',
            'Marsden', 'Meltham', 'Mirfield', 'Netherton', 'New Mill', 'Norristhorpe',
            'Overthorpe', 'Paddock', 'Ravensthorpe', 'Roberttown', 'Skelmanthorpe', 'Slaithwaite',
            'Thongsbridge', 'Upper Hopton', 'Upperthong', 'Westborough'
        ]
    },
    // --- Special Regions (not strict counties, but useful for game flavor) ---
    {
        county: 'Cotswolds', // A region spanning multiple counties
        postcodePrefixes: ['GL7', 'OX18', 'SN16', 'WR12'],
        towns: [
            'Cirencester', 'Stow-on-the-Wold', 'Bourton-on-the-Water', 'Chipping Norton', 'Tetbury',
            'Moreton-in-Marsh', 'Burford', 'Fairford', 'Broadway', 'Chipping Campden', 'Lechlade',
            'Northleach', 'Painswick', 'Winchcombe', 'Bibury', 'Castle Combe', 'Lower Slaughter',
            'Upper Slaughter', 'Woodstock', 'Ashton Keynes', 'Blockley', 'Broadwell',
            'Charlbury', 'Chedworth', 'Coln St Aldwyns', 'Eastleach', 'Evenlode', 'Great Rissington',
            'Guiting Power', 'Kemble', 'Kingham', 'Little Rissington', 'Lower Swell', 'Minchinhampton',
            'Naunton', 'Northleach', 'Oddington', 'Sherston', 'Shipton-under-Wychwood', 'South Cerney',
            'Southrop', 'Stanton', 'Taynton', 'Upper Swell', 'Westonbirt', 'Withington',
            'Adlestrop', 'Aldsworth', 'Ampney Crucis', 'Asthall', 'Aston Magna', 'Avening',
            'Barnsley', 'Barrington', 'Batsford', 'Bibury', 'Blockley', 'Box', 'Brimpsfield',
            'Broadwell', 'Burford', 'Chedworth', 'Churchill', 'Colesbourne', 'Coln St Aldwyns',
            'Compton Abdale', 'Condicote', 'Coombe', 'Didmarton', 'Donnington', 'Down Ampney',
            'Duntisbourne Abbots', 'Eastleach', 'Evenlode', 'Farmington', 'Fosscross', 'Great Rissington',
            'Guiting Power', 'Hampnett', 'Hazleton', 'Idbury', 'Icomb', 'Kemble', 'Kingham',
            'Lechlade', 'Little Rissington', 'Longborough', 'Lower Slaughter', 'Lower Swell',
            'Mickleton', 'Minchinhampton', 'Moreton-in-Marsh', 'Naunton', 'North Cerney',
            'Northleach', 'Oddington', 'Ozleworth', 'Poulton', 'Quenington', 'Ready Token',
            'Rodmarton', 'Salperton', 'Sapperton', 'Sevenhampton', 'Sherborne', 'Shipton Moyne',
            'Shipton-under-Wychwood', 'Siddington', 'Snowshill', 'South Cerney', 'Southrop',
            'Stanton', 'Stow-on-the-Wold', 'Swell', 'Taynton', 'Temple Guiting', 'Tetbury',
            'Toddington', 'Turkdean', 'Upper Slaughter', 'Upper Swell', 'Westonbirt', 'Whittington',
            'Winchcombe', 'Windrush', 'Withington', 'Wyck Rissington', 'Yanworth'
        ]
    },
    // --- Channel Islands (for completeness, though not England) ---
    {
        county: 'Guernsey',
        postcodePrefixes: ['GY'],
        towns: ['Saint Peter Port', 'Castel', 'St Sampson', 'St Martin', 'St Saviour', 'Forest', 'Vale', 'St Andrew', 'St Pierre du Bois', 'Torteval']
    },
    {
        county: 'Jersey',
        postcodePrefixes: ['JE'],
        towns: ['Saint Helier', 'Saint Brelade', 'Saint Clement', 'Saint Saviour', 'Saint Lawrence', 'Saint Peter', 'Saint John', 'Trinity', 'Grouville', 'Saint Martin', 'Saint Ouen', 'Saint Mary']
    }
];
