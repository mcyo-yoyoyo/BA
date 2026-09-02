/**
 * English overlays for public case pages. Chinese source stays in cases-data.js.
 */
(function (root) {
    function step(look, out) {
        return { look: look, out: out };
    }
    function ini(phase, title) {
        return { phase: phase, title: title };
    }

    root.WENDAO_CASE_EN = {
        ipms: {
            kicker: 'Product launch',
            title: 'A launch is a set of checks, not a press event',
            subtitle: 'Shelf day is fixed: supply, price and demo units sign the same plan',
            tagline: 'Launch day is shelf day. Channel policy and first-sale allocation must pass before the date locks.',
            audience: 'For consumer-electronics product, retail and supply launch owners',
            situation: 'Model years are shorter, and launch day is shelf day. A new product must align R&D readiness, supply ramp, channel policy, demo units and price. Many teams have charter packs, yet the required checks are signed only after the date is locked.',
            goal: 'Make launch a set of checks that can be audited and signed: no ads, no allocation and no in-store promise until ready.',
            window: 'Once the next model-year window locks, late policy changes hit retail and price.',
            pains: {
                ops: 'After the date locks, channel policy, demo units and allocation rules are still changing; oversell and stock-outs appear in the same week.',
                org: 'Product, supply, retail and content decide separately; no one can veto an unready launch.',
                data: 'Pass minutes sit in mail and sheets; the system cannot show who signed or which check failed.'
            },
            steps: [
                step('Does this business recoup on the new-product window, price and channel policy — on one canvas?', 'Write who pays, on what cadence, and which policy cannot be back-filled.'),
                step('Charter → expand → launch → first sale → end of life: which check has no joint sign-off.', 'Mark checks that should block unready spend, and stretches still signed in mail.'),
                step('Are supply, retail, content and demo units on the same operating picture?', 'List capabilities that must share one screen, not another weekly report.'),
                step('Org, process, data, systems: do the checks have veto power?', 'Score four dimensions. Mail minutes do not count as passed.'),
                step('In six months, mark only launch checks and first-sale allocation red.', 'Keep the rest under watch. Do not start eighteen things at once.'),
                step('Write owner, check and acceptance as one assignable item.', 'P0: supply and retail must sign on one screen before launch.'),
                step('From which month, for how long.', 'Place P0 in the next six months of the planning cycle.')
            ],
            empathy: [
                'Channel policy is still changing after the launch date locks',
                'First-sale oversell and stock-outs appear in the same week',
                'Price and spare-parts strategy appear only at clearance',
                'Pass minutes live in mail; the system has no veto record'
            ],
            publicFacts: [
                'Apple retail and the online store treat launch day as shelf day: store display, online availability and training materials share one time dependency.',
                'Xiaomi publicly treats hit-product pre-sale as an input to supply planning: demand locks capacity and allocation first.',
                'The contrast is whether time lines up and can be audited — not any internal acronym as an industry standard.'
            ],
            sourceNote: 'Public practices from Apple retail and Xiaomi new retail, for contrast only. Not a brand license or a Yoway client case. Confirm with your launch process.',
            outcome: 'Supply and retail must jointly sign before launch; first-sale allocation has a board; end-of-life and spare parts enter the roadmap early.',
            metric: { value: 'Pass', label: 'Charter, expand and launch can be audited and signed' },
            evidence: {
                baseline: 'Pass minutes sit in mail; supply and retail have no joint sign-off',
                target: 'Charter, expand and launch checks can be audited and signed',
                note: 'How checks are set is for contrast. Confirm with your launch process.'
            },
            initiativesPreview: [
                ini('P0', 'Launch check list and cross-team joint sign-off'),
                ini('P1', 'First-sale war room: allocation, price, activation'),
                ini('P2', 'End-of-life ops and channel clearance')
            ]
        },
        mkt: {
            kicker: 'Marketing science',
            title: 'Spend must match an audience, not only impressions',
            subtitle: 'One product story across retail and media; campaign assets can be reused',
            tagline: 'Tease, launch and first sale in phases. Audience, creative and SKU orders must match.',
            audience: 'For consumer-electronics brand, media and retail content owners',
            situation: 'Flagship drops still hunt for a “final-final” file on a shared drive. Brand and performance ads use two attribution models. Store posters and short video do not sell the same point.',
            goal: 'Every campaign leaves reusable audiences, creatives and wording; brand and performance map to the same order.',
            window: 'Once the next flagship window locks, mismatched stories become wasted media and confused retail.',
            pains: {
                ops: 'A flagship still searches shared drives for the latest cut; store and short-video claims diverge.',
                org: 'Brand, performance and retail content run separate calendars.',
                data: 'Media reports look strong but do not reconcile to SKU orders or audience tags.'
            },
            empathy: [
                'A flagship drop still hunts a “final-final” file on a shared drive',
                'Brand and performance ads use two attribution models that miss the order',
                'Store posters and short video do not sell the same point',
                'After a promo, only folders remain — no reusable campaign asset'
            ]
        },
        '5a': {
            kicker: 'Brand commerce',
            title: 'Owned store and marketplace flagships must share one path to purchase',
            subtitle: 'Same product and after-sales wording; inquiry, trade-in and membership can match',
            tagline: 'One model cannot carry three promises. Inquiries are answered, orders attributed, repeat purchase returns.',
            audience: 'For consumer-electronics commerce, service and membership owners',
            situation: 'Site and marketplace prices, gifts and after-sales wording do not match. Inquiries wait a day. Trade-in or installments jump off the checkout page.',
            goal: 'Every store follows one path: inquiry, payment, fulfillment and membership map to the same person.',
            window: 'As more traffic sits on marketplaces, three promises become three complaint lines.',
            pains: {
                ops: 'Site and marketplace prices, gifts and after-sales wording do not match.',
                org: 'Commerce, service and membership keep separate customer records.',
                data: 'Reviews and repeat purchase do not write back to media; membership is counted per store.'
            },
            empathy: [
                'Site and marketplace prices, gifts and after-sales wording do not match',
                'Inquiries wait a day; leads drop while people compare',
                'Trade-in or installments leave the current checkout page',
                'Reviews and repeat purchase do not write back to media; membership is counted per store'
            ]
        },
        itr: {
            kicker: 'Service',
            title: 'After a ticket is filed, the product still has to improve',
            subtitle: 'Hotline, app and mail-in share one ticket; progress is visible; complaints return to product',
            tagline: 'Explain once, show progress. Complaints should not sink in a ticket sea.',
            audience: 'For consumer-electronics after-sales, service and quality owners',
            situation: 'The same fault is logged three times — hotline, store and mail-in. Spare-part promises never reach the customer. Complaints stay in service; the product monthly does not see root cause.',
            goal: 'One ticket across channels: remote first, mail-in progress visible, top issues into the monthly improvement.',
            window: 'As return and repair volume rises, unclosed tickets become brand cost.',
            pains: {
                ops: 'The same fault is logged on hotline, store and mail-in.',
                org: 'Service, quality and product do not share one improvement loop.',
                data: 'First-time resolve depends on supervisor memory; quality cannot sample.'
            },
            empathy: [
                'The same fault is logged on hotline, store and mail-in',
                'Spare-part promises never reach the customer; progress is only a phone chase',
                'Complaints stay in service; the product monthly does not see root cause',
                'First-time resolve depends on supervisor memory; quality cannot sample'
            ]
        },
        trade: {
            kicker: 'Channel trade',
            title: 'Allocation and price decide profit more than promotion',
            subtitle: 'New retail flattens tiers and turns trade into data; traditional distribution still needs explainable allocation',
            tagline: 'Scarce units follow rules, diversion can be evidenced, rebate is not a quarterly war.',
            audience: 'For consumer-electronics channel, price and dealer-settlement owners',
            situation: 'Consumer electronics runs two channels: direct and new retail turn stores into data nodes; traditional national and provincial packs still run on orders, price patrols and rebate. If the two books stay separate, price will break.',
            goal: 'Allocation weights can be explained, diversion tickets can close, incentives accrue by tier — without buying another report.',
            window: 'Once a scarce model ships, unexplained allocation becomes channel conflict.',
            pains: {
                ops: 'Scarce units sit in head warehouses; county stores wait.',
                org: 'Direct and authorized stores keep two inventory books.',
                data: 'Rebate reconciliation still takes a quarter.'
            },
            empathy: [
                'Scarce units sit in head warehouses; county stores wait',
                'Regional price is broken by a cheap screenshot; evidence lives in chat',
                'Rebate reconciliation still takes a quarter',
                'Direct and authorized stores keep two inventory books that miss sell-out'
            ]
        },
        o2o: {
            kicker: 'Omnichannel retail',
            title: 'A flagship store is both a stage and a fulfillment node',
            subtitle: 'Pickup and store fulfillment share one inventory net; the store is not only display',
            tagline: 'A unit touched in store can be locked and picked up at once.',
            audience: 'For consumer-electronics retail operations and store-fulfillment owners',
            situation: 'During promos the store has stock while the site shows none. Rush transfers live in chat. Pickup and courier reassign cover each other and occupy stock twice.',
            goal: 'Pickup and store fulfillment share one pool; promised pickup time at a named store can be sampled.',
            window: 'Once omnichannel volume rises, two inventory books become broken promises.',
            pains: {
                ops: 'During promos the store has stock while the site shows none.',
                org: 'Rush transfers depend on chat, not a rule.',
                data: 'Pickup and courier reassign occupy stock twice; a unit in hand cannot be locked.'
            },
            empathy: [
                'During a promo the store has stock while the site shows none',
                'Rush transfers live in chat, with no executable rule',
                'Pickup and courier reassign occupy stock twice',
                'The customer can hold the unit; the system cannot lock it'
            ]
        },
        'appl-gtm': {
            kicker: 'Peak-season launch',
            title: 'Air-conditioner season is regional warehouse and install capacity, not a launch date',
            subtitle: 'Plan, plant and regional warehouse share one cadence; promise only inside the install radius',
            tagline: 'When the peak window opens, stock and installer slots fail together.',
            audience: 'For appliance supply, regional warehouse and install-capacity owners',
            situation: 'Headquarters stocks to a launch event; sites order to handover. Peak season finds empty warehouses and no installer slots. Project and retail promo compete for the same stock.',
            goal: 'Peak and project supply and install can be jointly signed; promises inside the install radius can be sampled.',
            window: 'Once the peak window opens, a late install promise becomes a complaint.',
            pains: {
                ops: 'Headquarters stocks to a launch; sites order to handover.',
                org: 'Project and retail promo compete for the same stock.',
                data: 'Install radius is a verbal promise; the system has no table.'
            },
            empathy: [
                'Headquarters stocks to a launch; sites order to handover',
                'In peak season the warehouse and installer calendar are both empty',
                'Project and retail promo compete for the same stock',
                'Install radius is a verbal promise; the system has no table'
            ]
        },
        'appl-mkt': {
            kicker: 'Trade-in marketing',
            title: 'A trade-in policy must land in store scripts',
            subtitle: 'Subsidy, brand offer and one recycle price must be calculable in store and deliverable by the technician',
            tagline: 'The “three frees” in ads must be deliverable in store and on site.',
            audience: 'For appliance brand, store retail and trade-in policy owners',
            situation: 'After stacking subsidies, stores cannot calculate what the customer pays. Online is one price; on-site adds dismantle or carry fees. Creative says one visit; the technician needs two.',
            goal: 'Campaign promises match on-site work: subsidy, brand offer and recycle price become one store price.',
            window: 'Once a national subsidy window opens, a split price becomes a complaint.',
            empathy: [
                'After stacking subsidies, stores cannot calculate what the customer pays',
                'Online is one price; on-site adds dismantle or carry fees',
                'Creative says one visit; the technician needs two',
                'Media reports look strong; recycle orders and complaints do not match'
            ]
        },
        'appl-ecom': {
            kicker: 'Deliver-and-install commerce',
            title: 'A large-appliance sale is whether deliver-and-install finishes in one visit',
            subtitle: 'Goods and technician on the same day: fulfillment, service net and booking as one promise',
            tagline: 'The customer did not buy a box. They bought “usable tomorrow”.',
            audience: 'For appliance commerce, fulfillment and install-booking owners',
            situation: 'Goods arrive; the technician needs another booking. Platform booking and brand technician calendars do not connect. High-wall drilling or extras priced on site become complaints.',
            goal: 'One-visit complete rate for main SKUs is measurable; delivery day can be promised; exceptions have an escalation path.',
            empathy: [
                'Goods have arrived; install still needs another booking',
                'Platform booking and brand technician calendars do not connect',
                'High-wall drilling or extras priced on site become complaints',
                'One-visit complete rate is not quantified; tickets cannot be reconciled'
            ]
        },
        'appl-svc': {
            kicker: 'Install service',
            title: 'The installer is the service contact',
            subtitle: 'Booking, first-time pass, parts and follow-up must return to product, not stop in service',
            tagline: 'Complaints usually appear on the second visit, not the first call.',
            audience: 'For appliance service-partner, quality and outlet owners',
            situation: 'Complaints appear on the second visit after a good first call. Parts promises stay verbal. Tickets close; product never sees install defects.',
            goal: 'First-visit pass and second-visit cost have a board; top install defects enter the monthly improvement.',
            empathy: [
                'Complaints appear on the second visit after a good first call',
                'Parts promises stay verbal; the customer waits again',
                'The ticket is closed; product never sees the install defect',
                'Partners are paid on attendance; first-time pass depends on sampling'
            ]
        },
        'appl-trade': {
            kicker: 'Project trade',
            title: 'Fit-out and project orders ship to handover, not to a retail promo',
            subtitle: 'Batch delivery, acceptance and warranty start follow the site',
            tagline: 'When the site wants goods on the same day as a store promo, both sides default.',
            audience: 'For appliance project, fit-out and building-channel owners',
            situation: 'Fit-out acceptance arrives while goods are still in a store promo. Project and retail compete for the same stock. Install lags the site; penalties land on sales.',
            empathy: [
                'Fit-out acceptance arrives while goods are still in a store promo',
                'Project and retail compete for the same stock',
                'Install lags the site; penalties land on sales',
                'Batch acceptance and warranty start do not match the register'
            ]
        },
        'appl-retail': {
            kicker: 'Scene retail',
            title: 'Specialty stores and designer channels sell a scene, not a SKU',
            subtitle: 'Showroom, stock and install booking share one promise',
            tagline: 'A set chosen in the showroom cannot wait two more weeks to complete.',
            audience: 'For appliance specialty, designer-channel and whole-home owners',
            situation: 'Showroom models and warehouse availability do not match. Designers will not promise stock. One missing piece holds the whole order.',
            empathy: [
                'Showroom models and warehouse availability do not match',
                'After a designer recommends, no one will promise stock',
                'One missing piece holds the whole order another two weeks',
                'Install booking cannot keep up with showroom closes'
            ]
        },
        'auto-gtm': {
            kicker: 'Financed close',
            title: 'Quote, loan and trade-in must finish in one order',
            subtitle: 'Direct: configure, trade-in and finance on one screen; dealer: discount and loan decline also enter the system',
            tagline: 'If the loan fails, a good test drive only walks the customer to a rival.',
            audience: 'For auto retail, finance and close owners (direct or dealer)',
            situation: 'Quotes live in chat; finance lives in another system. Floor discounts miss the system price. A declined loan has no fallback.',
            goal: 'Quote, trade-in, finance and insurance are required checks on the close path.',
            empathy: [
                'Quotes live in chat; finance lives in another system',
                'A manager’s verbal discount misses the system price',
                'A declined loan has no fallback; the customer does not return',
                'The direct app can finish the math; the store still splits spreadsheets'
            ]
        },
        'auto-mkt': {
            kicker: 'Lead marketing',
            title: 'Spend must return as a test-drive invite that can be followed',
            subtitle: 'Content and test drive sit with the brand; media and walk-in leads are de-duplicated and assigned on time',
            tagline: 'A lead is not a form count. It is whether someone answers on T+0.',
            audience: 'For auto brand lead, dealer-lead and media owners',
            situation: 'Ad reports look strong; stores say the numbers are fake. Site, vertical media and walk-in leads collide. High-intent leads time out with no alert.',
            empathy: [
                'Ad reports look strong; stores report poor lead quality',
                'Site, vertical media and walk-in leads do not match; collisions are common',
                'High-intent leads time out with no system alert',
                'A departing advisor takes high-intent customers in personal chat'
            ]
        },
        'auto-lead': {
            kicker: 'Showroom retail',
            title: 'From lead to test drive to order, there must be one opportunity',
            subtitle: 'Experience centers schedule drives; the opportunity sits in the brand app / CRM, not with one advisor',
            tagline: 'A drive without a follow-up spends media on a rival store.',
            audience: 'For auto experience stores, dealer retail and customer-ops owners',
            situation: 'Test-drive records live in chat; follow-up depends on habit. Peak cars collide; customers arrive and cannot drive. A departing advisor takes the book.',
            empathy: [
                'Test-drive records stay in chat; follow-up has no rule',
                'Peak cars collide; customers arrive and cannot drive',
                'A departing advisor takes high-intent customers in personal chat',
                'Managers see monthly volume, not timed-out tickets'
            ]
        },
        'auto-svc': {
            kicker: 'Workshop service',
            title: 'Handover is not the end; service and claims keep the customer',
            subtitle: 'App booking, visible progress; remote first; claims still close',
            tagline: 'Miss the first service and the next trade-in will not return.',
            audience: 'For auto after-sales, service ops and claims owners',
            situation: 'Owners call repeatedly for workshop progress. Tickets that could be remote still occupy a bay. Claim declines have no standard script.',
            empathy: [
                'Owners call repeatedly for workshop progress',
                'Tickets that could be remote still occupy a bay',
                'Claim declines have no standard script',
                'A missed first service has no system reminder'
            ]
        },
        'auto-trade': {
            kicker: 'Dealer trade',
            title: 'Inventory carrying cost and rebate hurt profit more than one month’s volume',
            subtitle: 'Direct looks at delivery-center lock discipline; dealers look at quota, age and rebate on one book',
            tagline: 'Quarter-end stuffing becomes next-quarter interest and discount.',
            audience: 'For auto dealer, inventory and rebate owners',
            situation: 'Quarter-end stuffing becomes next-quarter interest and promo. Hot cars are missing; slow cars occupy the yard. Sales watch ship-out; finance watches interest.',
            empathy: [
                'Quarter-end stuffing becomes next-quarter interest and promo',
                'Hot cars are missing; slow cars occupy the yard',
                'Sales watch ship-out; finance watches interest; the two books miss',
                'Direct lock-in is clean; dealer books are full of aged stock'
            ]
        },
        'auto-retail': {
            kicker: 'Handover',
            title: 'The handover list comes before the photo; cycle time must be promisable',
            subtitle: 'PDI and the list close before keys are handed over',
            tagline: 'Owners remember the week of plates, not the launch event.',
            audience: 'For auto delivery-center, dealer handover and registration owners',
            situation: 'After an app order, the delivery center owns cycle time. Public players treat PDI, insurance and training as a handover list. Many dealer halls still scatter PDI, plates and add-ons; the ritual is only a photo.',
            goal: 'Every list item closes before the photo; cycle time can be promised and sampled.',
            window: 'When a model-year peak arrives, a scattered list turns waiting into reputation cost.',
            pains: {
                ops: 'Finance is approved but the car is not there — or the car is there and plates cannot be booked.',
                org: 'Finance, PDI, insurance and plates each run their own desk; customers travel several times.',
                data: 'Materials and PDI are completed on handover day; the list is not visible.'
            },
            empathy: [
                'PDI and materials are still completed on handover day',
                'Finance is approved but the car is missing, or the car is there and cannot be plated',
                'Customers travel several times for insurance and plates',
                'The ceremony is formal; cycle time cannot be promised'
            ],
            outcome: 'Handover cycle time can be promised; complaints fall.',
            metric: { value: 'Complete', label: 'Checks, insurance and plates finish before keys' },
            evidence: {
                baseline: 'Materials and PDI completed on handover day',
                target: 'Every list item closes before the photo',
                note: 'Confirm with your handover cycle time.'
            },
            initiativesPreview: [
                ini('P0', 'Force the handover list to close'),
                ini('P1', 'Make PDI and allocation visible'),
                ini('P2', 'Run plates and insurance in parallel')
            ]
        }
    };

    const MORE_STEPS = {
        mkt: [
            step('Who pays for this campaign, which SKU it sells, and whether recoup is impressions or orders.', 'Put audience, claim and revenue on one canvas.'),
            step('Insight → strategy → creative → media → review: which stretch is not yet connected.', 'Mark shared-drive version hunts and reports that miss the order.'),
            step('Are content library, rights, device versions and audience return one capability set?', 'List what must share one screen, not another creative chat group.'),
            step('Org, process, data, systems: is attribution one definition?', 'Two dashboards do not count as scientific marketing.'),
            step('In six months, mark only the content platform and order attribution red.', 'Watch creative style later. Make “it matches” the red zone first.'),
            step('Who owns the campaign pack, and who accepts “creative matches the order”.', 'P0: rights, device versions and SKU map enter one library.'),
            step('Place campaign packs on the model-year calendar.', 'Lock creative six weeks before launch; lock the review two weeks after.')
        ],
        '5a': [
            step('Does this store recoup on one path to purchase — or three promises?', 'Write who pays, which gift and after-sales wording cannot diverge.'),
            step('Aware → inquire → order → fulfill → repurchase: which stretch is not yet connected.', 'Mark inquiry wait, trade-in drop-off and reviews that never return to media.'),
            step('Do commerce, service and membership share one customer record?', 'List capabilities that must share one person, not three store books.'),
            step('Org, process, data, systems: can an inquiry be closed on the same day?', 'Separate membership counts do not count as one path.'),
            step('In six months, mark only inquiry SLA and checkout continuity red.', 'Keep extra campaigns under watch.'),
            step('Write owner, check and acceptance as one assignable item.', 'P0: price, gift and after-sales wording match across owned store and marketplace.'),
            step('From which month, for how long.', 'Place P0 in the next six months of the planning cycle.')
        ],
        itr: [
            step('Does after-sales recoup on first-time resolve — or on ticket volume?', 'Write what “closed” means and which complaint must return to product.'),
            step('Request → intake → remote / mail-in → review → improve: which stretch is not yet connected.', 'Mark duplicate tickets and complaints that never return.'),
            step('Do hotline, store and mail-in share one ticket?', 'List capabilities that must share one screen.'),
            step('Org, process, data, systems: can first-time resolve be sampled?', 'Supervisor memory does not count as quality.'),
            step('In six months, mark only one-ticket and top-issue return red.', 'Keep extra channels under watch.'),
            step('Write owner, check and acceptance as one assignable item.', 'P0: one ticket across channels; top issues enter the monthly improvement.'),
            step('From which month, for how long.', 'Place P0 in the next six months of the planning cycle.')
        ],
        trade: [
            step('Does channel profit recoup on allocation and price — or on more promotions?', 'Write which allocation rule cannot be explained after the fact.'),
            step('Plan → fulfill → order → allocate → sell-out → settle: which stretch is not yet connected.', 'Mark experience-based allocation and quarterly rebate wars.'),
            step('Do direct and authorized stores share one inventory book?', 'List capabilities that must share sell-out, not two books.'),
            step('Org, process, data, systems: can diversion tickets close with evidence?', 'Chat screenshots do not count as a price case.'),
            step('In six months, mark only allocation rules and rebate accrual red.', 'Keep extra promotions under watch.'),
            step('Write owner, check and acceptance as one assignable item.', 'P0: scarce-unit weights can be explained; rebate accrues by tier.'),
            step('From which month, for how long.', 'Place P0 in the next six months of the planning cycle.')
        ],
        o2o: [
            step('Does retail recoup on one inventory pool — or on two promises?', 'Write which pickup promise must be sampleable at a named store.'),
            step('Forecast → reserve → approve → pickup / ship → settle: which stretch is not yet connected.', 'Mark two inventory books and rush transfers in chat.'),
            step('Do pickup and store fulfillment share one pool?', 'List capabilities that must lock a unit in hand.'),
            step('Org, process, data, systems: can a unit be locked when touched?', 'Double occupancy does not count as omnichannel.'),
            step('In six months, mark only one-pool inventory and pickup SLA red.', 'Keep extra store formats under watch.'),
            step('Write owner, check and acceptance as one assignable item.', 'P0: pickup and courier reassign share one reservation.'),
            step('From which month, for how long.', 'Place P0 in the next six months of the planning cycle.')
        ],
        'appl-gtm': [
            step('Does peak season recoup on regional warehouse and install slots — or on a launch date?', 'Write which promise is only valid inside the install radius.'),
            step('Stock → regional warehouse → install calendar → handover / retail: which stretch is not yet connected.', 'Mark launch stocking that collides with site demand.'),
            step('Do plan, plant and regional warehouse share one cadence?', 'List capabilities that must be jointly signed.'),
            step('Org, process, data, systems: is install radius a table, not a verbal promise?', 'Mail minutes do not count as capacity.'),
            step('In six months, mark only warehouse-and-install joint sign-off red.', 'Keep extra SKUs under watch.'),
            step('Write owner, check and acceptance as one assignable item.', 'P0: launch checks add install capacity and regional warehouse sign-off.'),
            step('From which month, for how long.', 'Place P0 before the next peak window.')
        ],
        'appl-mkt': [
            step('Does trade-in recoup on a store price the technician can deliver?', 'Write subsidy, brand offer and recycle price as one number.'),
            step('Policy → creative → store script → on-site work → reconcile: which stretch is not yet connected.', 'Mark “one price online, another on site”.'),
            step('Can store and technician calculate the same customer pay?', 'List capabilities that must share one script.'),
            step('Org, process, data, systems: do recycle orders match media reports?', 'Pretty reports do not count as delivered policy.'),
            step('In six months, mark only in-store price and one-visit delivery red.', 'Watch extra creatives later.'),
            step('Write owner, check and acceptance as one assignable item.', 'P0: stacked subsidies become one store price.'),
            step('From which month, for how long.', 'Place P0 on the next subsidy window.')
        ],
        'appl-ecom': [
            step('Does a large-appliance sale recoup on one-visit complete — or on a shipped box?', 'Write what “usable tomorrow” means on the order.'),
            step('Order → book → deliver → install → follow-up: which stretch is not yet connected.', 'Mark two tickets and extras priced on site.'),
            step('Do platform booking and brand technician calendars connect?', 'List capabilities that must share one promise.'),
            step('Org, process, data, systems: is one-visit complete measurable?', 'Unreconciled tickets do not count as commerce.'),
            step('In six months, mark only one-visit complete and exception path red.', 'Keep extra SKUs under watch.'),
            step('Write owner, check and acceptance as one assignable item.', 'P0: goods and technician on the same promised day.'),
            step('From which month, for how long.', 'Place P0 in the next six months of the planning cycle.')
        ],
        'appl-svc': [
            step('Does service recoup on first-visit pass — or on attendance?', 'Write which install defect must return to product.'),
            step('Book → visit → parts → follow-up → improve: which stretch is not yet connected.', 'Mark verbal parts promises and tickets that never return.'),
            step('Do booking, first-time pass and parts share one board?', 'List capabilities that must leave the service inbox.'),
            step('Org, process, data, systems: can second-visit cost be sampled?', 'Closed tickets do not count as quality.'),
            step('In six months, mark only first-visit pass and defect return red.', 'Keep extra channels under watch.'),
            step('Write owner, check and acceptance as one assignable item.', 'P0: top install defects enter the monthly improvement.'),
            step('From which month, for how long.', 'Place P0 in the next six months of the planning cycle.')
        ],
        'appl-trade': [
            step('Do project orders recoup on handover — or on a retail promo?', 'Write batch delivery, acceptance and warranty start against the site.'),
            step('Sign → stock → site call-off → install → accept: which stretch is not yet connected.', 'Mark collision with a store promo window.'),
            step('Do project and retail share one stock rule?', 'List capabilities that must stop competing for the same units.'),
            step('Org, process, data, systems: do acceptance and warranty match the register?', 'Penalties on sales do not count as a process.'),
            step('In six months, mark only site-tied call-off and acceptance red.', 'Keep extra projects under watch.'),
            step('Write owner, check and acceptance as one assignable item.', 'P0: project stock is reserved to handover, not to a promo.'),
            step('From which month, for how long.', 'Place P0 on the next fit-out wave.')
        ],
        'appl-retail': [
            step('Does scene retail recoup on a complete set — or on a single SKU?', 'Write which showroom promise must include stock and install.'),
            step('Sample → order → complete-set lock → install: which stretch is not yet connected.', 'Mark showroom models that miss the warehouse.'),
            step('Do showroom, stock and install booking share one promise?', 'List capabilities that must complete the set.'),
            step('Org, process, data, systems: can a designer promise stock?', 'A missing piece that holds the order does not count as a scene.'),
            step('In six months, mark only complete-set lock and install booking red.', 'Keep extra scenes under watch.'),
            step('Write owner, check and acceptance as one assignable item.', 'P0: a set chosen in the showroom can be locked the same week.'),
            step('From which month, for how long.', 'Place P0 in the next six months of the planning cycle.')
        ],
        'auto-gtm': [
            step('Does the close recoup on one order — quote, loan and trade-in together?', 'Write which check cannot stay in chat.'),
            step('Configure / quote → trade-in → finance → approve → lock: which stretch is not yet connected.', 'Mark chat repricing and declined loans with no fallback.'),
            step('Do quote, finance and insurance share one screen?', 'List capabilities that must finish in one order.'),
            step('Org, process, data, systems: does a verbal discount hit the system price?', 'Split spreadsheets do not count as a close.'),
            step('In six months, mark only one-order math and loan fallback red.', 'Keep extra campaigns under watch.'),
            step('Write owner, check and acceptance as one assignable item.', 'P0: quote, trade-in, finance and insurance are required checks.'),
            step('From which month, for how long.', 'Place P0 in the next six months of the planning cycle.')
        ],
        'auto-mkt': [
            step('Does media recoup on a test-drive invite that can be followed — or on form count?', 'Write what T+0 answer means.'),
            step('Spend → de-dupe → assign → invite: which stretch is not yet connected.', 'Mark fake-number complaints and timeouts with no alert.'),
            step('Are site, vertical media and walk-in leads one opportunity?', 'List capabilities that must de-dupe and assign on time.'),
            step('Org, process, data, systems: can high-intent timeout raise an alert?', 'Strong ad reports do not count as store leads.'),
            step('In six months, mark only T+0 assign and high-intent alert red.', 'Keep extra media under watch.'),
            step('Write owner, check and acceptance as one assignable item.', 'P0: a lead is an invite that someone answers the same day.'),
            step('From which month, for how long.', 'Place P0 in the next six months of the planning cycle.')
        ],
        'auto-lead': [
            step('Does showroom retail recoup on one opportunity — lead to drive to order?', 'Write which follow-up cannot stay with one advisor.'),
            step('Lead → arrive → drive → quote → order: which stretch is not yet connected.', 'Mark broken follow-up and verbal approvals.'),
            step('Does the opportunity sit in the brand CRM, not personal chat?', 'List capabilities that must survive advisor turnover.'),
            step('Org, process, data, systems: can peak cars be scheduled without collision?', 'Monthly volume does not count as timed tickets.'),
            step('In six months, mark only one-opportunity and drive calendar red.', 'Keep extra events under watch.'),
            step('Write owner, check and acceptance as one assignable item.', 'P0: drive records and follow-up rules live in one system.'),
            step('From which month, for how long.', 'Place P0 in the next six months of the planning cycle.')
        ],
        'auto-svc': [
            step('Does service recoup on retained owners — or on bay occupancy?', 'Write which ticket should stay remote.'),
            step('Book → receive → work → inspect → handover → follow-up: which stretch is not yet connected.', 'Mark progress-by-phone and claim declines with no script.'),
            step('Are booking, progress and claims one visible path?', 'List capabilities that must leave the phone chase.'),
            step('Org, process, data, systems: can a missed first service raise a reminder?', 'Occupied bays do not count as retention.'),
            step('In six months, mark only visible progress and first-service reminder red.', 'Keep extra add-ons under watch.'),
            step('Write owner, check and acceptance as one assignable item.', 'P0: progress is visible; claims still close with a standard script.'),
            step('From which month, for how long.', 'Place P0 in the next six months of the planning cycle.')
        ],
        'auto-trade': [
            step('Does dealer profit recoup on inventory age and rebate — or on one month’s volume?', 'Write which quarter-end stuffing becomes next-quarter interest.'),
            step('Quota → stock → sell-out → rebate → finance: which stretch is not yet connected.', 'Mark quarter-end stuffing.'),
            step('Do sales ship-out and finance interest share one book?', 'List capabilities that must show aged stock.'),
            step('Org, process, data, systems: can hot-car gaps and slow-car yards be seen together?', 'Two books do not count as dealer trade.'),
            step('In six months, mark only age-and-rebate one book red.', 'Keep extra incentives under watch.'),
            step('Write owner, check and acceptance as one assignable item.', 'P0: quota, age and rebate sit on one book.'),
            step('From which month, for how long.', 'Place P0 before the next quarter-end.')
        ]
    };

    Object.keys(MORE_STEPS).forEach(function (id) {
        const pack = root.WENDAO_CASE_EN[id];
        if (pack && !pack.steps) pack.steps = MORE_STEPS[id];
    });

    const MORE_COPY = {
        mkt: {
            outcome: 'Templated production shortens prep; brand and performance boards match the SKU.',
            sourceNote: 'Public practices from Apple retail narrative and Xiaomi community / store, for contrast. Confirm with your content library and attribution.',
            publicFacts: [
                'Apple runs one product story across site, retail and media; cadence follows the narrative, not media-bought impressions that later need a claim.',
                'Xiaomi treats community and content as reusable assets: forums, reviews and store scripts share one claim so campaigns are reused, not reshot.',
                'The contrast is one rhythm for story, audience and order — not any ad platform’s impression count.'
            ]
        },
        '5a': {
            outcome: 'Inquiries are answered; trade-in and installments stay on one path; reviews return to media.',
            sourceNote: 'Channel layout follows Apple retail / delivery policy and Xiaomi store public notes. Conversion figures are assessment targets. Confirm with each store’s data.',
            publicFacts: [
                'Apple’s site and Apple Store keep the same product, price and after-sales wording; an online order can be picked up in store.',
                'Xiaomi’s store and official marketplace shops treat one product and membership as one record; pickup connects the online order to store fulfillment.',
                'The contrast is one price, one path and one membership — not a single store’s GMV.'
            ]
        },
        itr: {
            outcome: 'Remote resolve rises; mail-in lead time can be promised; top issues enter the monthly improvement.',
            sourceNote: 'Service contrast uses Apple Support and Xiaomi service public entries. Not an endorsement. Confirm with your after-sales quality sample.',
            publicFacts: [
                'Apple Support puts booking, repair progress and coverage in one entry, emphasizing one explanation and a visible status.',
                'Xiaomi’s service entry covers store, app and shop; mail-in and in-store jobs can be tracked; device migration is written as part of the visit.',
                'The contrast is visible progress, one ticket and complaints that return — not another brand’s outlet count as your target.'
            ]
        },
        trade: {
            outcome: 'Allocation weights can be explained; diversion tickets close; incentives accrue by tier.',
            sourceNote: 'Channel form contrasts Xiaomi new-retail public reports and Apple owned retail. Calibrate with your contracts and inventory books.',
            publicFacts: [
                'Xiaomi new retail publicly connects authorized stores and mall orders as one book: pickup is one pool, not two prices for online and offline units.',
                'Apple owned retail barely uses national-pack allocation; the store is an inventory node and the brand holds the price.',
                'Traditional distribution remains. The contrast is explainable allocation and closable diversion — not historic store counts as a current promise.'
            ]
        },
        o2o: {
            outcome: 'Pickup and store fulfillment share one pool; rush paths follow a rule, not a favor.',
            sourceNote: 'Fulfillment form follows Apple delivery / pickup policy and Xiaomi home pickup reports. Calibrate with store stock and orders.',
            publicFacts: [
                'Apple treats pickup and courier as one inventory promise: a unit reserved in store is taken off the pool.',
                'Xiaomi home pickup is described as connecting the mall order to a named store, not a second inventory book.',
                'The contrast is one reservation — not two books that cover each other in a promo week.'
            ]
        },
        'appl-gtm': {
            outcome: 'Peak season holds stock; project orders keep their promise; clearance does not break price.',
            sourceNote: 'Contrast uses public statements from Midea lighthouse / Meicloud, Haier COSMOPlat and Hisense user operations. Confirm with your regional warehouse and install calendar.',
            publicFacts: [
                'Midea describes lighthouse plants, Meicloud and Annto as one plan–make–warehouse–deliver chain: lead time and fulfillment are one path, not a launch date.',
                'Haier COSMOPlat publicly talks mass customization and visible orders: changeover follows the user order, not a show calendar.',
                'Hisense publicly moves from selling products to operating users: regional supply is tied to service, not only to factory exit.'
            ]
        },
        'appl-mkt': {
            outcome: 'Campaigns can be delivered; complaints fall; recycle and new-product orders match.',
            sourceNote: 'Brand contrast uses public user-ops and trade-in wording from Haier, Midea and Hisense; on-site models follow platform public policy. Confirm with campaign pages and ticket samples.',
            publicFacts: [
                'Haier publicly treats trade-in and user operations as one store conversation, not an ad claim detached from the technician.',
                'Midea and Hisense describe subsidy and recycle as a price the store can calculate.',
                'The contrast is a deliverable store price — not media reports that miss recycle orders.'
            ]
        },
        'appl-ecom': {
            outcome: 'Main SKUs can promise a deliver-and-install day; exceptions have an escalation path.',
            sourceNote: 'Contrast uses public wording from Midea Annto, Haier service and Hisense user entries; platform deliver-and-install rules are policy background. Confirm with booking fulfillment rates.',
            publicFacts: [
                'Midea Annto is described as connecting warehouse and last-mile so goods and the technician can share one day.',
                'Haier service treats install booking as a required step after the sale, not as ended at logistics sign-off.',
                'The contrast is one-visit complete — not a shipped box plus a second booking.'
            ]
        },
        'appl-svc': {
            outcome: 'Second visits fall; top install defects enter the monthly improvement.',
            sourceNote: 'Contrast uses public service / user-ops wording from the three brands. Confirm with first-visit pass and partner settlement.',
            publicFacts: [
                'Haier’s service net treats the installer as the service contact: booking, parts and follow-up stay in one loop.',
                'Midea and Hisense publicly put user operations after the first visit, not only after the first call.',
                'The contrast is first-visit pass and defects that return — not attendance as quality.'
            ]
        },
        'appl-trade': {
            outcome: 'Projects keep their promise; retail does not run out.',
            sourceNote: 'Fit-out contrast uses public cadence from Haier scenes and Midea buildings — not a single developer case. Confirm with your project batches.',
            publicFacts: [
                'Haier scene retail and Midea building channel publicly time stock to handover, not to a store promo.',
                'Project acceptance and warranty start follow the site.',
                'The contrast is site-tied call-off — not one pool that both sides default on.'
            ]
        },
        'appl-retail': {
            outcome: 'A set promise can be kept; the designer channel can repurchase.',
            sourceNote: 'Scene retail contrast uses public wording from Haier scenes, Midea whole-home / lighthouse lead time and Hisense smart home. Confirm with specialty-store orders.',
            publicFacts: [
                'Haier scene stores sell a room, not a SKU: showroom, stock and install are one promise.',
                'Midea whole-home and Hisense smart-home wording tie the set to a completable order.',
                'The contrast is a locked set — not a missing piece that holds the order two more weeks.'
            ]
        },
        'auto-gtm': {
            outcome: 'Peak hours still produce a deliverable total price; a decline has a fallback.',
            sourceNote: 'Direct contrast uses Tesla order and new-player purchase flows; dealer contrast uses common store pain. Not a single OEM official KPI.',
            publicFacts: [
                'Direct players put configure, trade-in and finance on one screen before lock-in.',
                'Dealer stores still split quote, loan and discount across desks and chat.',
                'The contrast is one order — not a good test drive that walks the customer to a rival after a decline.'
            ]
        },
        'auto-mkt': {
            outcome: 'Cost per lead can be explained; stores stop reporting fake numbers.',
            sourceNote: 'Contrast uses Tesla / new-player lead entries and common dealer-lead pain. Reconcile with your CRM and ad console.',
            publicFacts: [
                'Brand apps treat a lead as a test-drive invite that must be answered, not a form count.',
                'Stores still report collision between site, vertical media and walk-in leads.',
                'The contrast is T+0 assign — not a strong ad report with no store follow-up.'
            ]
        },
        'auto-lead': {
            outcome: 'Test-drive conversion can be explained; managers see timed-out tickets.',
            sourceNote: 'Contrast uses Tesla / new-player experience stores and app drive entries. Confirm with your drive log.',
            publicFacts: [
                'Experience centers schedule drives; the opportunity sits in the brand app / CRM.',
                'Many halls still keep drive records in chat and lose them when an advisor leaves.',
                'The contrast is one opportunity — not monthly volume without timed tickets.'
            ]
        },
        'auto-svc': {
            outcome: 'Workshop arrivals stay on time; claims can be explained; extended warranty can be offered.',
            sourceNote: 'Contrast uses Tesla service and new-player app after-sales entries. Confirm with workshop and claims data.',
            publicFacts: [
                'App booking and visible progress are described as the default service path; remote comes first.',
                'Claim declines still need a standard script or they become reputation cost.',
                'The contrast is retained owners — not bay occupancy.'
            ]
        },
        'auto-trade': {
            outcome: 'Intake follows a rule; rebate can be expected.',
            sourceNote: 'Direct contrast uses delivery-center lock-in; dealer contrast uses common finance cadence. Confirm with inventory and financing books.',
            publicFacts: [
                'Direct lock-in is described as clean: the delivery center owns the reserved unit.',
                'Dealer books still mix quota, age and rebate across sales and finance.',
                'The contrast is one book — not quarter-end stuffing that becomes next-quarter interest.'
            ]
        }
    };

    Object.keys(MORE_COPY).forEach(function (id) {
        const pack = root.WENDAO_CASE_EN[id];
        const extra = MORE_COPY[id];
        if (!pack || !extra) return;
        if (!pack.outcome && extra.outcome) pack.outcome = extra.outcome;
        if (!pack.sourceNote && extra.sourceNote) pack.sourceNote = extra.sourceNote;
        if (!pack.publicFacts && extra.publicFacts) pack.publicFacts = extra.publicFacts;
    });
})(typeof window !== 'undefined' ? window : globalThis);
