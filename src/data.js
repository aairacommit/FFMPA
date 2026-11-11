/* ================= Data ================= */
let EDITION_DATE = "2026-11-11";
const COUNTRIES = {
  IN:{name:"India", short:"India", tz:"IST", greet:"Namaste"},
  US:{name:"United States", short:"USA", tz:"ET", greet:"Good morning"},
  UK:{name:"United Kingdom", short:"UK", tz:"GMT", greet:"Good morning"},
  AU:{name:"Australia", short:"Australia", tz:"AEDT", greet:"G'day"},
  KR:{name:"South Korea", short:"Korea", tz:"KST", greet:"Annyeong"},
  DE:{name:"Germany", short:"Germany", tz:"CET", greet:"Guten Morgen"},
  FR:{name:"France", short:"France", tz:"CET", greet:"Bonjour"}
};
const CATS = {
  space:{label:"Space", c:["#25317F","#6A4BD6"]},
  science:{label:"Science", c:["#1060A8","#3FC1E8"]},
  planet:{label:"Planet & Climate", c:["#0B7F75","#7DD3A0"]},
  sports:{label:"Sports", c:["#E2412F","#FFB400"]},
  civics:{label:"Government & Elections", c:["#2C5CC5","#8DB0FF"]},
  world:{label:"World & Peace", c:["#55627E","#AFBCD6"]},
  culture:{label:"Culture & Festivals", c:["#F07800","#FFD25E"]},
  history:{label:"History", c:["#7E4F33","#E2B27A"]},
  nature:{label:"Animals & Nature", c:["#21794D","#A9D660"]},
  tech:{label:"Tech & AI", c:["#6B35D8","#EE5BC2"]},
  business:{label:"Money & Business", c:["#4D7C0F","#A3C960"]}
};
const TYPES = {
  people:{label:"Person", c:"#FFD3CC"}, places:{label:"Place", c:"#CDEFE9"}, civics:{label:"Civics", c:"#D6E2FF"},
  science:{label:"Science", c:"#DCEBFF"}, tech:{label:"Technology", c:"#EBDDFF"}, history:{label:"History", c:"#F3E1CF"},
  words:{label:"Word", c:"#FFEFC2"}, sports:{label:"Sports", c:"#FFE0CC"}
};
const UL = {people:"#F0503E",places:"#0E8F83",civics:"#2C5CC5",science:"#1E88E5",tech:"#7B3FE4",history:"#A0663F",words:"#FFB400",sports:"#E2412F"};

const G = {
  "app":["App","tech","A program on a phone, tablet or computer, like a game or a calculator.","Short for application: software built to do a job on a device. Apps are written in programming languages; Apple's devices use one called Swift."],
  "coding":["Coding","tech","Writing instructions that tell a computer what to do.","Writing step-by-step instructions in a programming language. Computers follow the instructions exactly, so coders test and fix their work again and again."],
  "discount":["Discount","words","Money taken off the usual price.","A reduction from the normal price, often shown as a percentage. Shops use discounts to sell more, clear old stock or win customers from rivals."],
  "e-commerce":["E-commerce","tech","Buying and selling things on the internet.","Electronic commerce: shopping online through websites and apps, with goods delivered to your door. China is the world's biggest e-commerce market."],
  "yuan":["Yuan","words","The money used in China.","China's currency, also called renminbi. In 2026, one US dollar was worth roughly seven yuan."],
  "melbourne":["Melbourne","places","A big city in the south of Australia.","Australia's second-largest city and the capital of the state of Victoria, known for sport, coffee and its trams."],
  "toulouse":["Toulouse","places","A city in the south of France where many planes are built.","A city in south-west France, called the 'Pink City' for its brick buildings. Airbus assembles many of its passenger jets here."],
  "world-record":["World record","words","The best result anyone has ever achieved, checked and written down.","The best performance ever officially recorded. Guinness World Records, first published in 1955, checks and lists records from fastest to tallest to longest."],
  "project-sunrise":["Project Sunrise","tech","Qantas's plan to fly from Australia to London or New York without stopping.","Qantas's long-running plan for non-stop flights from Sydney to London and New York, using specially built Airbus A350-1000ULR jets with fewer seats and extra fuel."],
  "remembrance-day":["Remembrance Day","history","A day to remember people who died in wars, on 11 November.","Held on 11 November, the anniversary of the 1918 armistice. In Australia, people pause for a minute's silence at 11 am; it was called Armistice Day until after the Second World War."],
  "awm":["Australian War Memorial","places","A museum and memorial in Canberra about Australians who served in wars.","A national shrine, museum and archive in Canberra, opened on 11 November 1941. Its Roll of Honour lists over 103,000 Australians who died in war."],
  "canberra":["Canberra","places","Australia's capital city, where Parliament meets.","Australia's capital, a planned city chosen as a compromise between Sydney and Melbourne. Parliament has met there since 1927."],
  "governor-general":["Governor-General","civics","The person who represents the King in Australia.","The representative of the monarch in Australia. The Governor-General signs laws passed by Parliament and leads national ceremonies."],
  "seoul":["Seoul","places","The capital city of South Korea.","South Korea's capital and largest city, home to about 9.4 million people, with the Han River running through it."],
  "suneung":["Suneung","civics","South Korea's big exam for getting into university.","The College Scholastic Ability Test, taken each November by school leavers in South Korea. It covers Korean, maths, English, Korean history and other subjects."],
  "tiangong":["Tiangong","science","China's space station. Its name means Heavenly Palace.","China's three-module space station in low Earth orbit, completed in 2022. Crews of three usually stay for about six months."],
  "hong-kong":["Hong Kong","places","A busy city on the south coast of China.","A special administrative region of China, with its own laws and currency. It was a British colony until 1997."],
  "eeg":["EEG","science","A cap with sensors that picks up tiny electrical signals from your brain.","Electroencephalography: sensors on the scalp record the brain's electrical activity, showing how different areas work together."],
  "satellite":["Satellite","science","Something that goes around a planet. People build satellites to take pictures and send signals.","An object that orbits a planet. Artificial satellites relay phone and TV signals, guide GPS and photograph Earth for weather and maps."],
  "hefei":["Hefei","places","A city in eastern China known for science.","The capital of Anhui province in eastern China, home to major research institutes in physics, space and AI."],
  "ai":["AI","tech","Artificial intelligence: computer programs that can learn and make choices.","Artificial intelligence: computer systems that learn patterns from data to recognise images, understand language or make predictions."],
  "berlin":["Berlin","places","The capital city of Germany.","Germany's capital and largest city. It was split into East and West from 1949 to 1990."],
  "berlin-wall":["Berlin Wall","history","A wall that split the city of Berlin in two from 1961 to 1989.","A guarded barrier built by East Germany in 1961 to stop people leaving for West Berlin. Its opening on 9 November 1989 led to German reunification on 3 October 1990."],
  "east-germany":["East Germany","history","A country that existed from 1949 to 1990, before Germany became one again.","The German Democratic Republic, a communist state allied to the Soviet Union. It joined West Germany in 1990."],
  "st-martin":["St Martin's Day","words","A day on 11 November when children carry lanterns and remember a kind soldier.","The feast of Martin of Tours, a Roman soldier who became a bishop. The legend says he shared half his cloak with a beggar in the snow."],
  "carnival":["Carnival","words","A time of costumes, parades and parties before the season of Lent.","A festive season in parts of Germany and elsewhere, often called the 'fifth season'. In the Rhineland it opens on 11 November at 11:11 and peaks before Ash Wednesday."],
  "cologne":["Cologne","places","A city on the river Rhine in Germany, famous for its cathedral and carnival.","Germany's fourth-largest city, on the Rhine. Its Gothic cathedral is a UNESCO World Heritage Site, and its carnival is one of Europe's biggest."],
  "arc-de-triomphe":["Arc de Triomphe","places","A giant arch in the middle of Paris.","A monumental arch in Paris, finished in 1836. Since 1921 the tomb of the Unknown Soldier has lain beneath it."],
  "unknown-soldier":["Unknown Soldier","history","A soldier whose name we do not know, buried to honour everyone who died in a war.","An unidentified soldier buried in a national tomb to represent all who died. France's lies under the Arc de Triomphe, with a flame rekindled every evening."],
  "bleuet":["Bleuet","words","A small blue flower that French people wear to remember soldiers.","The cornflower, France's symbol of remembrance. It is linked to the young soldiers of 1915, nicknamed 'bleuets' after their blue uniforms."],
  "delhi":["Delhi","places","India's capital city, where the national government meets.","India's National Capital Territory, with over 30 million people in its wider region. New Delhi, inside it, is the seat of India's government and Parliament."],
  "smog":["Smog","science","Smoke plus fog. A dirty haze in the air that makes it hard to see and to breathe.","A mix of smoke and fog, or more generally polluted air full of tiny particles and gases. Winter smog is worse in north India because cold, still air traps pollution close to the ground."],
  "aqi":["AQI","science","Air Quality Index: a number that shows how clean the air is. A low number is good. A high number is bad.","Air Quality Index. India's scale runs from Good (0 to 50) through Poor (201 to 300) and Very Poor (301 to 400) up to Severe (401 to 500). It is based on pollutants like PM2.5, particles so tiny they can reach deep into the lungs."],
  "stubble-burning":["Stubble burning","science","When farmers burn the leftover stalks in their fields after harvest to clear them quickly.","Burning crop leftovers, mainly rice stubble in Punjab and Haryana, to clear fields before sowing wheat. The smoke drifts toward Delhi in October and November. Machines that mulch the stubble, and microbes that break it down, are alternatives."],
  "grap":["GRAP","civics","An emergency plan for Delhi's bad air days. Its rules get stricter as the air gets worse.","The Graded Response Action Plan, with four stages linked to AQI levels. Stage III can stop most construction and keep some older vehicles off the road; Stage IV is the strictest."],
  "diwali":["Diwali","words","The festival of lights! People light lamps, share sweets and celebrate good winning over evil.","A major festival in India and around the world, usually in October or November. For many Hindus it marks Lord Rama's return to Ayodhya. Sikhs, Jains and some Buddhists celebrate on the same days for their own reasons."],
  "ayodhya":["Ayodhya","places","An ancient city in Uttar Pradesh, on the Saryu river. In the Ramayana, it is Lord Rama's home.","A city in Uttar Pradesh on the Saryu river, important in Hinduism as the birthplace of Lord Rama in the epic Ramayana. It has been a place of pilgrimage for centuries."],
  "diya":["Diya","words","A small clay lamp filled with oil, with a cotton wick that you light.","A small oil lamp, usually made of baked clay, lit during festivals across South Asia. The word comes from the Sanskrit deepa, meaning lamp, which also gives us Deepavali, a row of lamps."],
  "nehru":["Jawaharlal Nehru","people","India's first Prime Minister. Children lovingly called him Chacha Nehru.","A leader of India's freedom movement alongside Mahatma Gandhi, and Prime Minister from 1947 until his death in 1964. His government set up many of India's first universities, research labs and the IITs."],
  "prime-minister":["Prime Minister","civics","The leader of the government in countries like India and the UK.","The head of government in a parliamentary system. The Prime Minister is usually the leader of the party with the most seats in parliament, and chooses the ministers who run each department."],
  "uncrc":["Convention on the Rights of the Child","civics","A promise signed by almost every country to protect children's rights, like the right to learn, to play and to be safe.","A 1989 United Nations treaty that lists children's rights, from education to protection from harm. It is the most widely ratified human rights treaty in history."],
  "gukesh":["Gukesh D","people","A chess grandmaster from Chennai who became world champion when he was just 18.","Dommaraju Gukesh, a grandmaster from Chennai, born in 2006. In December 2024 he beat Ding Liren of China to become the youngest undisputed world chess champion ever."],
  "chess":["Chess","sports","A board game for two players. You win by trapping the other player's king. That is called checkmate!","A strategy game played on a board of 64 squares. It is thought to have grown from chaturanga, a game played in India around 1,500 years ago."],
  "uzbekistan":["Uzbekistan","places","A country in Central Asia, famous for its blue-tiled cities on the old Silk Road.","A Central Asian country of about 37 million people, with Tashkent as its capital. Its cities Samarkand and Bukhara were great stops on the Silk Road trade routes."],
  "nasa":["NASA","science","America's space agency. It sent the first people to walk on the Moon in 1969.","The National Aeronautics and Space Administration, founded in 1958. It ran the Apollo Moon landings, the Space Shuttle and the Mars rovers, and now leads the Artemis programme."],
  "astronaut":["Astronaut","science","A person trained to travel and work in space.","Someone trained to fly in space. Russia calls them cosmonauts, China calls them taikonauts and India calls them gaganauts, after its Gaganyaan programme."],
  "moon-south-pole":["Moon's south pole","science","The bottom of the Moon, where some craters stay dark and freezing cold forever.","A region where the Sun stays low on the horizon, so some crater floors never see sunlight. Temperatures there can drop below minus 200°C, cold enough to keep water ice frozen for billions of years."],
  "water-ice":["Water ice","science","Frozen water. On the Moon, it could give astronauts water to drink.","Frozen water. Split into hydrogen and oxygen, it can provide air to breathe and rocket fuel, which is why it could make a long-term Moon base possible."],
  "artemis":["Artemis","science","NASA's programme to send people back to the Moon.","NASA's Moon programme, named after Apollo's twin sister in Greek myth. Artemis II flew four astronauts around the Moon in April 2026. Artemis III will test Moon landers in Earth orbit in 2027."],
  "china":["China","places","A huge country in Asia, home to the Great Wall and more than a billion people.","One of the two most populous countries in the world, with about 1.4 billion people; its capital is Beijing. Its space agency has landed rovers on the Moon's far side and on Mars, and runs its own space station, Tiangong."],
  "veteran":["Veteran","words","Someone who used to serve in the army, navy or air force.","A person who has served in the armed forces. Many countries hold special days to honour veterans and to support them after their service."],
  "ww1":["First World War","history","A huge war from 1914 to 1918 that pulled in countries from all around the world.","A global war from 1914 to 1918 between the Allies (including Britain, France, Russia and later the US) and the Central Powers (led by Germany and Austria-Hungary). More than a million soldiers from India served."],
  "armistice":["Armistice","history","An agreement to stop fighting.","A formal agreement to stop fighting, usually before a final peace treaty is signed. The First World War armistice was signed in a railway carriage in France; the Treaty of Versailles followed in 1919."],
  "remembrance-sunday":["Remembrance Sunday","history","A day in the UK to remember people who died in wars.","Held on the second Sunday of November in the UK, with services at war memorials and a two-minute silence at 11 am."],
  "cenotaph":["Cenotaph","history","A tall stone memorial in London for people who died in wars.","A Greek word meaning empty tomb: a monument to people who are buried elsewhere. London's Cenotaph on Whitehall was designed by Edwin Lutyens and unveiled in its stone form in 1920."],
  "king-charles":["King Charles III","people","The King of the United Kingdom. He became king in 2022.","The UK's monarch since September 2022, after the death of his mother, Queen Elizabeth II. As head of state his role is mostly ceremonial; elected politicians run the government."],
  "poppy":["Poppy","history","A red flower people wear to remember soldiers.","Red poppies grew on the battle-scarred fields of Flanders in the First World War and inspired the poem In Flanders Fields. Since 1921, paper poppies have been sold in the UK to support veterans."],
  "children-in-need":["Children in Need","words","A BBC charity that raises money to help children across the UK.","BBC Children in Need, the BBC's UK charity. Since 1980 it has held a yearly appeal and given grants to local projects that help children and young people."],
  "antalya":["Antalya","places","A sunny city on the Mediterranean coast of Türkiye.","A large city on Türkiye's southern Mediterranean coast, and one of the most visited holiday spots in the world."],
  "turkiye":["Türkiye","places","A country that is partly in Europe and partly in Asia. In English it used to be called Turkey.","A country bridging Europe and Asia. Its capital is Ankara and its largest city is Istanbul. In 2022 the UN began using the name Türkiye at the government's request."],
  "cop":["COP","civics","A big yearly meeting where countries talk about climate change.","Conference of the Parties: the yearly summit of countries that signed the UN climate treaty of 1992. COP21 in 2015 produced the Paris Agreement."],
  "climate-change":["Climate change","science","Earth slowly getting warmer over many years, mostly because people burn coal, oil and gas.","Long-term shifts in temperature and weather. Since the 1800s, burning fossil fuels has added carbon dioxide to the air, trapping heat. Earth is already more than 1°C warmer than before the industrial age."],
  "un":["United Nations","civics","A club of almost every country in the world that works for peace and helps people.","Founded in 1945 after the Second World War, with 193 member countries. Its family includes the Security Council, UNICEF and the World Health Organization."],
  "guterres":["António Guterres","people","The leader of the United Nations. He used to be Prime Minister of Portugal.","UN Secretary-General since 2017 and a former Prime Minister of Portugal. His second and final term ends on 31 December 2026."],
  "paris-agreement":["Paris Agreement","civics","A promise made by countries in 2015 to slow down global warming.","A 2015 treaty in which countries agreed to keep warming well below 2°C and to try for 1.5°C, with each country setting its own targets."],
  "russia":["Russia","places","The biggest country in the world. It stretches across Europe and Asia.","The world's largest country by area, spanning 11 time zones, with Moscow as its capital. It is led by President Vladimir Putin."],
  "ukraine":["Ukraine","places","A large country in eastern Europe. Its flag is blue and yellow.","Europe's second largest country by area, with Kyiv as its capital. It has been defending itself against Russia's full-scale invasion since February 2022."],
  "abu-dhabi":["Abu Dhabi","places","The capital city of the United Arab Emirates, in the Middle East.","The capital of the UAE, a federation of seven emirates on the Gulf. It often hosts international talks because it keeps ties with many sides."],
  "mediator":["Mediator","words","A helper who listens to both sides of an argument and helps them find a fair answer.","A go-between who helps two sides negotiate, often carrying proposals back and forth when the sides will not agree face to face."],
  "whoi":["Woods Hole","science","A famous ocean science centre in the United States.","The Woods Hole Oceanographic Institution in Massachusetts, founded in 1930. Its deep-sea submarine Alvin helped explore the wreck of the Titanic."],
  "twilight-zone":["Twilight zone","science","A dark part of the ocean deep below the surface, where very little sunlight reaches.","The mesopelagic zone, about 200 to 1,000 m deep. Many creatures there glow, and lots of them swim up toward the surface at night to feed."],
  "fireball":["Fireball","science","A super bright shooting star that can light up the sky for a moment.","A meteor brighter than the planet Venus. Fireballs happen when larger pieces of space dust and rock burn up in the atmosphere."],
  "meteor-shower":["Meteor shower","science","When lots of shooting stars appear in the sky over a few nights.","It happens when Earth passes through a trail of dust left behind by a comet. The bits burn up in our atmosphere, about 100 km up, as streaks of light."],
  "mars":["Mars","science","The red planet, fourth from the Sun. Robot rovers from Earth are exploring it right now.","The fourth planet from the Sun. Its red colour comes from iron oxide, which is rust, in its dusty soil."],
  "jupiter":["Jupiter","science","The biggest planet in our solar system. It is a giant ball of gas.","The largest planet, more than 11 times wider than Earth. Its Great Red Spot is a storm bigger than our whole planet."],
  "unesco":["UNESCO","civics","Part of the United Nations that looks after learning, science and culture around the world.","The United Nations Educational, Scientific and Cultural Organization, founded in 1945. It also keeps the list of World Heritage Sites, such as the Taj Mahal."]
};

/* kind: "news" must be dated within the last 3 days; "calendar" is a dated explainer about today or the coming week */
const S = [
/* ===== INDIA ===== */
{id:"in-air", scope:"IN", cat:"planet", emoji:"🌫️", date:"2026-11-10", kind:"news",
 x:{t:`Smoggy skies over Delhi after Diwali`, b:[
  `The air in [[delhi|Delhi]] got very dirty this week. A grey haze called [[smog|smog]] covered the city. Smoke from firecrackers, farm fires and traffic all add to it.`,
  `Scientists measure air with a number called the [[aqi|AQI]]. The higher the number, the worse the air. Delhi's AQI went close to 400, which counts as very poor.`,
  `Schools were told to offer online classes so children could learn from home.`]},
 o:{t:`Delhi's air hits the season's worst after Diwali`, b:[
  `[[delhi|Delhi]] woke up to thick [[smog|smog]] on 9 November, the morning after Diwali, with the citywide [[aqi|Air Quality Index]] near 400, the top of the very poor band. Several neighbourhoods crossed 400, which counts as severe.`,
  `Experts point to a mix of causes: firecracker smoke, [[stubble-burning|stubble burning]] in nearby farm states, vehicle exhaust and weak winds that let pollution hang low over the city.`,
  `Authorities had already brought in Stage III of [[grap|GRAP]], an emergency plan that limits construction and some vehicles, and schools were told to offer online classes. By the next morning the AQI had eased to around 345, still very poor.`]},
 think:`Which causes of smog do you think people could change the fastest? Which are hardest?`,
 quiz:{q:"What does a higher AQI number mean?", a:["Cleaner air","Dirtier air","Hotter weather","More rain"], c:1},
 src:[["Open Magazine, 9 Nov","https://openthemagazine.com/india/delhi-aqi-touches-400-after-diwali-burari-hits-441"],["Outlook Business, 10 Nov","https://www.outlookbusiness.com/planet/climate/delhi-air-quality-improves-still-very-poor-grap3-on-hold"],["Asia News Network, 9 Nov","https://asianews.network/?p=313482"]]},

{id:"in-diyas", scope:"IN", cat:"culture", emoji:"🪔", date:"2026-11-08", kind:"news",
 x:{t:`Three million lamps light up Ayodhya`, b:[
  `For [[diwali|Diwali]], the city of [[ayodhya|Ayodhya]] lit about 3 million [[diya|diyas]] along the banks of the Saryu river.`,
  `A diya is a small clay lamp with oil and a cotton wick. The celebration is called Deepotsav, which means festival of lamps.`,
  `Imagine three million tiny flames twinkling all at once!`]},
 o:{t:`Deepotsav 2026 lights 3 million diyas on the Saryu`, b:[
  `[[ayodhya|Ayodhya]] in Uttar Pradesh marked [[diwali|Diwali]] with Deepotsav, lighting around 3 million [[diya|diyas]] along the banks of the Saryu river.`,
  `Diwali, the festival of lights, is celebrated by Hindus, Sikhs, Jains and some Buddhists, and its idea of light winning over darkness is shared by people of many backgrounds.`,
  `Huge celebrations also raise questions that cities now plan for, like cleaning up afterwards and keeping air pollution down.`]},
 think:`How would you organise 3 million lamps so they all get lit on time?`,
 quiz:{q:"What is a diya?", a:["A small clay oil lamp","A firecracker","A sweet","A drum"], c:0},
 src:[["Business Standard, 8 Nov","https://www.business-standard.com/india-news/sc-issues-directions-to-tackle-digital-fraud-asks-rbi-to-circulate-sop-126080401730_1.html"]]},

{id:"in-chess", scope:"IN", cat:"sports", emoji:"♟️", date:"2026-11-09", kind:"news", when:"Starts 24 November",
 x:{t:`India's chess champion gets ready for a big match`, b:[
  `[[gukesh|Gukesh]], from Chennai, is the world [[chess|chess]] champion. Later this month he will defend his title in the World Chess Championship.`,
  `He will play Javokhir Sindarov from [[uzbekistan|Uzbekistan]]. The match starts on 24 November and can go on until 12 December.`,
  `Chess is a battle of brains, with no luck at all!`]},
 o:{t:`Gukesh vs Sindarov: the world title match is two weeks away`, b:[
  `[[gukesh|Gukesh D]] of Chennai will defend his World [[chess|chess]] Championship title in a match running from 24 November to 12 December. His challenger is Javokhir Sindarov of [[uzbekistan|Uzbekistan]].`,
  `Gukesh became the youngest undisputed world champion in history in December 2024, when he beat China's Ding Liren at the age of 18. Sindarov, also in his early twenties, won the FIDE World Cup in 2025.`,
  `A title match is a long duel between just two players, game after game, testing preparation, nerves and stamina as much as clever moves.`]},
 think:`Chess players train their memory and focus. What could you practise to improve your focus?`,
 quiz:{q:"Which city is Gukesh from?", a:["Chennai","Mumbai","Kolkata","Delhi"], c:0},
 src:[["Khel Now, November sports calendar","https://khelnow.com/indian-sports-calendar-schedule/indian-sports-calendar-november-schedule-202611"],["IndiaSportsHub via Google News","https://news.google.com/publications/CAAqLggKIihDQklTR0FnTWFoUUtFbWx1WkdsaGMzQnZjblJ6YUhWaUxtTnZiU2dBUAE"]]},

{id:"in-childrens", scope:"IN", cat:"history", emoji:"🎈", date:"2026-11-14", kind:"calendar", when:"Coming up Saturday",
 x:{t:`Children's Day is this Saturday!`, b:[
  `On 14 November, India celebrates Children's Day. It is the birthday of [[nehru|Jawaharlal Nehru]], India's first [[prime-minister|Prime Minister]].`,
  `He loved spending time with children, and many kids called him Chacha Nehru, which means Uncle Nehru.`,
  `Schools often hold fun events, shows and games on this day.`]},
 o:{t:`Why India celebrates children on 14 November`, b:[
  `This Saturday, 14 November, is Children's Day, or Bal Diwas, in India. The date is the birth anniversary of [[nehru|Jawaharlal Nehru]], born in 1889, who became India's first [[prime-minister|Prime Minister]] at independence in 1947.`,
  `Nehru believed children were the future of the nation, and his government built schools, universities and science institutions, including the first IITs.`,
  `Countries mark Children's Day on different dates. The UN's World Children's Day falls on 20 November, the day in 1989 when the UN adopted the [[uncrc|Convention on the Rights of the Child]].`]},
 think:`If you could add one new right to a list of children's rights, what would it be?`,
 quiz:{q:"Whose birthday is celebrated as Children's Day in India?", a:["Mahatma Gandhi","Jawaharlal Nehru","A. P. J. Abdul Kalam","Rabindranath Tagore"], c:1},
 src:[]},

/* ===== USA ===== */
{id:"us-astronauts", scope:"US", cat:"space", emoji:"👩‍🚀", date:"2026-11-09", kind:"news",
 x:{t:`NASA is looking for new astronauts`, b:[
  `Want to help build a base on the Moon? [[nasa|NASA]] is asking grown-ups to apply to become [[astronaut|astronauts]].`,
  `Right now NASA has only 32 active astronauts, and it needs more for trips to the [[moon-south-pole|Moon]]. Training takes two years and is very tough.`,
  `Last time NASA asked, more than 8,000 people applied and only 10 were chosen!`]},
 o:{t:`NASA opens astronaut applications for the Moon Base era`, b:[
  `[[nasa|NASA]] opened applications for a new astronaut class on 7 November, with a deadline of 3 December. The agency has 32 active [[astronaut|astronauts]], and officials say there is far more work than people to do it.`,
  `The new class will train for two years, learning spacewalks, lunar geology and how to fly high-performance jets, and may one day live and work at a planned base near the [[moon-south-pole|Moon's south pole]].`,
  `Competition is fierce: in the last round, held in 2024, more than 8,000 people applied and 10 were chosen. NASA expects to pick the new class in late 2027. Applicants must be US citizens with the right education and experience.`]},
 think:`Which school subjects do you think would help most if you wanted to be an astronaut?`,
 quiz:{q:"How many active astronauts does NASA have right now?", a:["10","32","370","8,000"], c:1},
 src:[["AP via ABC7, 9 Nov","https://abc7news.com/story/want-fly-moon-nasa-is-looking-new-astronauts-help-grow-artemis-program/20026559"],["NPR via KUOW, 8 Nov","https://www.kuow.org/npr-news/2026-11-08/nasa-is-looking-for-astronauts-to-live-and-work-on-the-moon"],["New Space Economy, 9 Nov","https://newspaceeconomy.ca/2026/11/09/nasa-opens-applications-for-its-next-astronaut-class/"]]},

{id:"us-veterans", scope:"US", cat:"history", emoji:"🎖️", date:"2026-11-11", kind:"calendar", when:"Today",
 x:{t:`Today is Veterans Day`, b:[
  `Today, 11 November, Americans say thank you to [[veteran|veterans]]. Veterans are people who served in the country's armed forces, like the army or the navy.`,
  `The day began as Armistice Day, when the fighting in the [[ww1|First World War]] stopped at 11 o'clock on 11 November 1918.`,
  `Many towns hold parades, and people thank veterans they know.`]},
 o:{t:`Veterans Day: why 11/11 at 11`, b:[
  `Veterans Day, today, honours everyone who has served in the US armed forces. It grew out of Armistice Day, which marked the moment the guns fell silent in the [[ww1|First World War]]: the 11th hour of the 11th day of the 11th month of 1918, when an [[armistice|armistice]] took effect.`,
  `In 1954 the US renamed it Veterans Day to include people who served in later wars. Unlike Memorial Day in May, which remembers those who died in service, Veterans Day thanks all who served.`,
  `Other countries mark the same date in their own way: the UK holds a two-minute silence, Canada calls it Remembrance Day, and France and Belgium keep Armistice Day.`]},
 think:`Is there someone in your family or neighbourhood who has served? What would you like to ask them?`,
 quiz:{q:"What did Armistice Day first mark?", a:["The end of fighting in the First World War","The first Moon landing","US independence","The end of the Second World War"], c:0},
 src:[]},

/* ===== UK ===== */
{id:"uk-remembrance", scope:"UK", cat:"history", emoji:"🕊️", date:"2026-11-08", kind:"news",
 x:{t:`The country pauses to remember`, b:[
  `On Sunday, people across the UK stood quietly for two minutes. It was [[remembrance-sunday|Remembrance Sunday]], a day to remember people who died in wars.`,
  `[[king-charles|King Charles]] laid a wreath of red [[poppy|poppies]] at the [[cenotaph|Cenotaph]] in London, and thousands of [[veteran|veterans]] marched past.`,
  `Today is Armistice Day, so many schools will pause again for two minutes at 11 o'clock.`]},
 o:{t:`Remembrance week: the Cenotaph on Sunday, a national silence today`, b:[
  `On 8 November, [[king-charles|King Charles III]] led the UK in a two-minute silence at the [[cenotaph|Cenotaph]] in Whitehall, London, then laid the first wreath in memory of those who have died in conflict since the [[ww1|First World War]].`,
  `Prince William followed, along with other royals and senior politicians including Prime Minister Andy Burnham. Thousands of [[veteran|veterans]] then marched past the memorial.`,
  `Today, 11 November, is Armistice Day, and schools, shops and offices are invited to pause for another two-minute silence at 11 am, the moment the [[armistice|armistice]] took effect in 1918. The silence has been kept every year since 1919, and the red [[poppy|poppy]] has been its symbol since the 1920s.`]},
 think:`Why do you think people use silence to remember, instead of speeches?`,
 quiz:{q:"Where in London is the Cenotaph?", a:["Whitehall","Camden","Wimbledon","Greenwich"], c:0},
 src:[["Euro Weekly News, 8 Nov","https://euroweeklynews.com/2026/11/08/london-remembers-king-charles-leads-remembrance-sunday-as-thousands-honour-britains-fallen/"],["ITV News, 8 Nov","https://www.itv.com/news/2026-11-08/king-leads-nation-in-two-minute-silence-to-honour-war-dead-on-remembrance-sunday"],["Royal British Legion","https://www.britishlegion.org.uk/stories/two-minute-silence"]]},

{id:"uk-cin", scope:"UK", cat:"culture", emoji:"🐻", date:"2026-11-13", kind:"calendar", when:"Coming up Friday",
 x:{t:`Get spotty! Children in Need is on Friday`, b:[
  `On Friday, 13 November, people across the UK will raise money for BBC [[children-in-need|Children in Need]]. Lots of schools hold spotty dress-up days and bake sales.`,
  `The mascot is Pudsey Bear, who wears a spotty bandana over one eye.`,
  `This year Pudsey even spoke for the first time, to remind grown-ups to listen when children want to talk about their feelings.`]},
 o:{t:`BBC Children in Need returns this Friday`, b:[
  `BBC [[children-in-need|Children in Need]] holds its big appeal night on Friday, 13 November, with a live show on BBC One. Schools, clubs and families have been fundraising for weeks with spotty dress-down days, bake sales and challenges.`,
  `The money goes as grants to local charities and community groups that support children and young people across the UK. The first appeal was held in 1980, and Pudsey Bear became the mascot in 1985.`,
  `In May, Pudsey spoke for the first time ever, in a campaign asking adults to be someone children can talk to about their mental health.`]},
 think:`If your class raised money for a good cause, what would you choose and why?`,
 quiz:{q:"What does Pudsey Bear wear over one eye?", a:["A spotty bandana","A pirate patch","Sunglasses","A monocle"], c:0},
 src:[["BBC Children in Need, May 2026","https://www.bbcchildreninneed.co.uk/2026/05/pudsey-finds-his-voice-a-landmark-moment-to-support-children-across-the-uk/"],["Awareness Days calendar","https://www.awarenessdays.com/awareness-days-calendar/bbc-children-in-need/"]]},

/* ===== AUSTRALIA ===== */
{id:"au-flight", scope:"AU", cat:"tech", emoji:"✈️", date:"2026-11-09", kind:"news",
 x:{t:`A plane flew from Australia to France without stopping`, b:[
  `A big plane flew all the way from [[melbourne|Melbourne]] to [[toulouse|Toulouse]] in France without landing even once. The trip took about 24 hours!`,
  `This week it became an official [[world-record|world record]]: the longest flight ever made by a passenger plane.`,
  `Soon, families may be able to fly from Sydney to London in one go, with no stop in the middle.`]},
 o:{t:`Melbourne to Toulouse non-stop is now a world record`, b:[
  `On 9 November, plane maker Airbus announced that its A350-1000ULR has officially set the [[world-record|Guinness World Record]] for the longest flight by distance by a passenger airliner. The jet flew 23,155 km non-stop from [[melbourne|Melbourne]] to [[toulouse|Toulouse]] on 27 and 28 July, in a little over 24 hours.`,
  `Thirteen people were on board, including three Airbus test pilots and two Qantas pilots. The route crossed the Pacific, North America and the Atlantic. An extra fuel tank in the back of the plane gives it about 1,850 km more range.`,
  `The flight is part of Qantas's [[project-sunrise|Project Sunrise]], which aims to start the world's longest scheduled flights, from Sydney to London, in 2027.`]},
 think:`If you had to sit on a plane for 24 hours, how would you keep busy and stay comfortable?`,
 quiz:{q:"Where did the record flight start?", a:["Sydney","Perth","Melbourne","Brisbane"], c:2},
 local:{FR:`The record flight landed in Toulouse, the French city where Airbus builds its planes.`},
 src:[["Airbus press release, 9 Nov","https://www.airbus.com/en/newsroom/press-releases/2026-11-airbus-a350-1000ulr-for-qantas-breaks-world-distance-record"],["Aviation24.be, 9 Nov","https://www.aviation24.be/airlines/qantas/a350-1000ulr/"]]},

{id:"au-remembrance", scope:"AU", cat:"history", emoji:"🌺", date:"2026-11-10", kind:"news",
 x:{t:`A very old poppy wreath for Remembrance Day`, b:[
  `Today Australians stop for one minute at 11 o'clock. It is [[remembrance-day|Remembrance Day]], when people remember those who served and died in wars.`,
  `At the [[awm|Australian War Memorial]] in [[canberra|Canberra]], a wreath of red [[poppy|poppies]] made in 1934 will be laid. It is the oldest wreath the memorial owns!`,
  `The memorial is also turning 85 years old today.`]},
 o:{t:`Australian War Memorial marks 85 years with a 1934 wreath`, b:[
  `The [[awm|Australian War Memorial]] in [[canberra|Canberra]] opened on Armistice Day in 1941, so today's [[remembrance-day|Remembrance Day]] service marks its 85th anniversary. The national ceremony begins at 10:45 am, with a minute's silence at 11 am.`,
  `[[governor-general|Governor-General]] Sam Mostyn will lay a scarlet [[poppy|poppy]] wreath from 1934, the memorial's oldest. A fragile cloth poppy worn by First World War [[veteran|veteran]] Stanley Mason on opening day in 1941 will also go on display.`,
  `The memorial's Roll of Honour lists more than 103,000 Australians who died in wars and conflicts. Its director said the day is a time to remember how terrible war is.`]},
 think:`Why do you think people keep old objects like this wreath for so many years?`,
 quiz:{q:"How old is the Australian War Memorial this year?", a:["50 years","85 years","100 years","25 years"], c:1},
 src:[["The West Australian via The Nightly, 10 Nov","https://thenightly.com.au/australia/remembrance-day-historic-wreath-to-take-centre-stage-in-canberra-for-remembrance-days-85th-anniversary-c-23137126"],["DVA Anzac Portal","https://anzacportal.dva.gov.au/commemoration/days/remembrance-day"]]},

/* ===== SOUTH KOREA ===== */
{id:"kr-snow", scope:"KR", cat:"nature", emoji:"❄️", date:"2026-11-08", kind:"news",
 x:{t:`Surprise! Seoul's first snow came early`, b:[
  `On Sunday, the first snow of the season fell in [[seoul|Seoul]], the capital of South Korea.`,
  `It came 12 days earlier than usual, and almost a month earlier than last year.`,
  `To count it, a weather watcher has to see the snowflakes falling with their own eyes!`]},
 o:{t:`Seoul sees its first snow almost four weeks earlier than last year`, b:[
  `Snow was spotted in [[seoul|Seoul]] on 8 November, making it the city's first snow of the season. That is 26 days earlier than last year and 12 days earlier than the average.`,
  `A trough of low pressure passing north of the Korean peninsula brought raindrops and a few snowflakes to the Seoul area and Gangwon province.`,
  `Seoul's first snow is official only when an observer at the city's weather station in Jongno district sees snow falling with their own eyes, even if it melts before it reaches the ground.`]},
 think:`Is there a first sign of a new season that you look forward to where you live?`,
 quiz:{q:"How does Seoul decide the first snow has come?", a:["A computer counts flakes","An observer sees it falling","Snow covers a car","The president announces it"], c:1},
 src:[["Yonhap News Agency, 8 Nov","https://www.yna.co.kr/view/AKR20261108022551530"]]},

{id:"kr-suneung", scope:"KR", cat:"civics", emoji:"✏️", date:"2026-11-19", kind:"calendar", when:"Coming up next Thursday",
 x:{t:`The big school exam day is coming`, b:[
  `Next Thursday, high school students across South Korea will take the [[suneung|Suneung]]. It is a giant test that helps decide which university they go to.`,
  `More than 550,000 students signed up! The test lasts almost the whole day.`,
  `Younger students often cheer for them outside the exam halls.`]},
 o:{t:`Over 550,000 students get ready for the Suneung`, b:[
  `South Korea's national university entrance exam, the [[suneung|Suneung]], takes place on Thursday 19 November. According to the exam board, 551,864 people applied this year.`,
  `Students must be in their exam rooms by 8:10 am. The first paper, Korean, starts at 8:40 am and the last section ends at 5:45 pm. Results arrive on 11 December.`,
  `The day is taken so seriously that in past years offices have started later to keep roads clear, and planes have avoided taking off or landing during the English listening test.`]},
 think:`What helps you stay calm before a big test?`,
 quiz:{q:"When do Suneung students get their results?", a:["The same evening","11 December","In January","After one year"], c:1},
 src:[["Ministry of Education via KDI","https://eiec.kdi.re.kr/policy/materialView.do?num=255989"],["Exam timetable guide","https://foxcg.com/2027-csat-schedule/"],["Application figures","https://www.yugacrew.com/crewletter/suneung-date-2027"]]},

/* ===== WORLD: space and tech from China ===== */
{id:"cn-astro", scope:"global", cat:"space", emoji:"🧠", date:"2026-11-09", kind:"news",
 x:{t:`Astronauts test how brains work in space`, b:[
  `Three astronauts are living on China's space station, [[tiangong|Tiangong]]. One of them, Lai Ka-ying, is the first astronaut from [[hong-kong|Hong Kong]].`,
  `They wear special caps that read signals from their brains. This shows how living in space changes the way we think and move.`,
  `They have been up there for more than five months!`]},
 o:{t:`Hong Kong's first astronaut runs brain tests on Tiangong`, b:[
  `The Shenzhou-23 crew, Zhu Yangzhu, Zhang Zhiyuan and Lai Ka-ying, [[hong-kong|Hong Kong]]'s first astronaut, have been on the [[tiangong|Tiangong]] space station since launching on 24 May for a six-month mission.`,
  `Using [[eeg|EEG]] caps, they have been tracking brain networks, how the eyes and hands work together, and how people react to different lighting. Near-infrared scans look at how spaceflight changes the brain over time.`,
  `They also carried out touch and grip tests, checked their spacesuits and practised emergency survival skills. Results like these help plan longer missions to the Moon.`]},
 think:`If you lived in space for six months, what would you miss most about Earth?`,
 quiz:{q:"Lai Ka-ying is the first astronaut from where?", a:["Shanghai","Macau","Hong Kong","Taiwan"], c:2},
 src:[["China Daily Hong Kong, 9 Nov","https://www.chinadailyhk.com/article/642442"]]},

{id:"cn-cloud", scope:"global", cat:"tech", emoji:"🛰️", date:"2026-11-09", kind:"news",
 x:{t:`Computers that work in space`, b:[
  `China has a plan for a "space cloud": [[satellite|satellites]] that can think and work out answers while flying around Earth.`,
  `Some test satellites have already spotted bridges and stadiums from space, even when they were covered in snow!`,
  `This could help people respond faster to floods and earthquakes.`]},
 o:{t:`China plans a "space cloud" of computing satellites`, b:[
  `At a conference in [[hefei|Hefei]] on 9 November, Chinese scientists unveiled the Xingyun Constellation Plan, a network where remote-sensing, communication and computing [[satellite|satellites]] work together and process some data in orbit before sending it to Earth.`,
  `It is aimed at uses like watching forests and farmland, and responding to disasters. A separate project, the Three-Body Computing Constellation, has already put 10 [[ai|AI]] models into orbit and linked six satellites.`,
  `In one test, an AI on board a satellite picked out stadiums and bridges across 189 square km of north-west China, even under heavy snow.`]},
 think:`What problem on Earth would you want a smart satellite to help solve?`,
 quiz:{q:"What is special about these satellites?", a:["They carry people","They can process data in space","They are made of wood","They only work at night"], c:1},
 src:[["Global Times, citing CMG and Xinhua, 9 Nov","https://www.globaltimes.cn/page/202611/1373973.shtml"]]},

/* ===== GERMANY ===== */
{id:"de-wall", scope:"DE", cat:"history", emoji:"🌹", date:"2026-11-09", kind:"news",
 x:{t:`Roses for the day the Berlin Wall opened`, b:[
  `For 28 years, a wall split the city of [[berlin|Berlin]] in two. Families on different sides could not visit each other.`,
  `On 9 November 1989, the gates opened and people climbed on the wall to celebrate. That was 37 years ago this week!`,
  `On Monday, people lit candles and put colourful roses in a piece of the old wall.`]},
 o:{t:`Berlin remembers the fall of the Wall, 37 years on`, b:[
  `On 9 November, leaders and residents gathered at the Berlin Wall Memorial on Bernauer Straße to mark 37 years since the [[berlin-wall|Berlin Wall]] opened. They lit candles and slipped colourful roses into a surviving section of the wall.`,
  `The wall divided communist [[east-germany|East Germany]] from West Berlin from 1961 to 1989. On the night of 9 November 1989, the Bornholmer Straße crossing opened at 9:20 pm, and by just after midnight every crossing in the city was open. Germany reunited less than a year later.`,
  `Berlin is holding its second Freedom Week, with around 170 events until 14 November. The date is also when Germans remember the attacks on Jewish people by the Nazis in 1938.`]},
 think:`Why do you think people choose flowers and candles to remember important days?`,
 quiz:{q:"How many years ago did the Berlin Wall open?", a:["17","27","37","47"], c:2},
 src:[["berlin.de with dpa, 9 Nov","https://www.berlin.de/en/news/10747178-5559700-rosen-und-kerzen-erinnern-an-mauerfall-u.en.html"],["evangelisch.de, 9 Nov","https://www.evangelisch.de/inhalte/260806/09-11-2026/berlin-erinnert-mauerfall-vor-37-jahren"],["berlin.de, Freedom Week","https://www.berlin.de/aktuelles/10742732-958090-second-freedom-week-to-mark-anniversary-.html"]]},

{id:"de-martin", scope:"DE", cat:"culture", emoji:"🏮", date:"2026-11-11", kind:"calendar", when:"Today",
 x:{t:`Lanterns tonight, costumes at 11:11!`, b:[
  `Today is [[st-martin|St Martin's Day]]. Tonight, children all over Germany walk through the streets with lanterns they made themselves, singing lantern songs.`,
  `A rider dressed as St Martin often leads the parade on a horse.`,
  `And in [[cologne|Cologne]], [[carnival|carnival]] season started at exactly 11:11 this morning, with thousands of people in costumes!`]},
 o:{t:`St Martin's lanterns and the 11:11 start of carnival`, b:[
  `On 11 November, children across Germany join lantern processions for [[st-martin|St Martin's Day]], singing songs like "Ich geh mit meiner Laterne". A rider dressed as a Roman soldier plays St Martin, and many parades end with a bonfire and a sweet bread figure called a Weckmann.`,
  `St Martin is remembered for cutting his cloak in half to share it with a freezing beggar, which is why the day is about sharing and kindness.`,
  `The same day, the [[carnival|carnival]] season officially opens at 11:11 am. In [[cologne|Cologne]] about 30,000 people in costumes gather in the old town for the countdown, the start of a season that peaks in February.`]},
 think:`St Martin shared his cloak. What is something you could share with someone today?`,
 quiz:{q:"At what time does carnival season begin on 11 November?", a:["Midnight","11:11 am","6:00 pm","9:00 am"], c:1},
 src:[["koeln.de, 11.11. programme","https://www.koeln.de/karneval/11-11-koeln-karneval/11-11-sessionseroeffnung-in-der-altstadt/"],["Festivals in Deutschland, St Martin","https://www.festivalsindeutschland.de/festival/st-martin-laternenzug-koblenz"]]},

/* ===== FRANCE ===== */
{id:"fr-school", scope:"FR", cat:"history", emoji:"🏫", date:"2026-11-10", kind:"news",
 x:{t:`French schools hold a ceremony for 11 November`, b:[
  `This week, for the first time, schools all over France are holding a special ceremony to remember people who died for the country.`,
  `Pupils read texts, sing songs and share work they made in class. Then everyone is quiet for a moment.`,
  `It happens around 11 November, the day the First World War ended in 1918.`]},
 o:{t:`Every French school now marks 11 November`, b:[
  `From this school year, every elementary school, collège and lycée in France, from CM1 upwards, must hold a ceremony honouring all those who died for France. Schools pick a day within four days before or after 11 November, since the 11th itself is a public holiday.`,
  `The ceremony takes place inside the school, using texts, songs or projects prepared in class, followed by a moment of silence. The rule was set out by Education Minister Édouard Geffray in July.`,
  `Many head teachers support it, saying it passes on shared history. Some teachers' unions disagree, arguing that taking part in remembrance should stay a free choice.`]},
 think:`What do you think is a good way for a school to remember history?`,
 quiz:{q:"From which class do French pupils join the new ceremony?", a:["Nursery","CM1","Only lycée","University"], c:1},
 olderOnly:false,
 src:[["Bulletin officiel no. 27, 2 Jul 2026","https://www.education.gouv.fr/bo/2026/Hebdo27/MENE2614920C"],["Sud Radio","https://www.sudradio.fr/societe/a-lecole-la-commemoration-de-larmistice-du-11-novembre-fait-des-vagues"]]},

{id:"fr-armistice", scope:"FR", cat:"history", emoji:"💙", date:"2026-11-11", kind:"calendar", when:"Today",
 x:{t:`Why France wears a blue flower today`, b:[
  `Today is a holiday in France. It is the day the First World War ended, 108 years ago.`,
  `In Paris, there is a ceremony at the [[arc-de-triomphe|Arc de Triomphe]], where a flame burns for an [[unknown-soldier|Unknown Soldier]].`,
  `While the UK and Australia wear red poppies, many French people wear a little blue flower called the [[bleuet|bleuet]].`]},
 o:{t:`Armistice Day: the flame, the Unknown Soldier and the bleuet`, b:[
  `France marks the 108th anniversary of the 1918 [[armistice|armistice]] today with a national holiday. The President leads the main ceremony at the [[arc-de-triomphe|Arc de Triomphe]] in Paris, shown live on France 2 from 9:30 am.`,
  `Beneath the arch lies the [[unknown-soldier|Unknown Soldier]], buried in 1921 to stand for all the soldiers who were never identified. Each year the flame on the tomb is rekindled.`,
  `France's symbol of remembrance is the [[bleuet|bleuet]], or cornflower, which kept blooming on the battlefields and matched the blue uniforms of young French soldiers.`]},
 think:`Why might different countries choose different flowers to remember the same war?`,
 quiz:{q:"What is France's flower of remembrance?", a:["Red poppy","Blue cornflower","White rose","Sunflower"], c:1},
 src:[["France Télévisions, 20 Oct","https://www.francetvpro.fr/contenu-de-presse/79111483"],["Élysée, 2025 ceremony","https://www.elysee.fr/emmanuel-macron/2025/11/11/ceremonie-de-commemoration-du-107e-anniversaire-de-larmistice-de-1918"]]},

/* ===== WORLD ===== */
{id:"g-swift", scope:"global", cat:"tech", emoji:"💻", date:"2026-11-10", kind:"news",
 x:{t:`A coding challenge for students around the world`, b:[
  `Apple has announced a [[coding|coding]] challenge for students. Each student builds a small [[app|app]] that someone can try in 3 minutes or less.`,
  `It is free to enter, and students can send in their apps from 8 to 28 February.`,
  `Many great apps start with something you love, like animals, music or space!`]},
 o:{t:`Swift Student Challenge 2027 announced: build an app anyone can try in 3 minutes`, b:[
  `Apple announced the Swift Student Challenge 2027 on 10 November. Students who meet the age and eligibility rules can submit an [[app|app]] playground between 8 and 28 February 2027, and for the first time it can be built for any Apple platform.`,
  `Entry is free. The app must be something a judge can experience in three minutes or less, and it can be about any topic. Students need a Mac or iPad with Apple's free tools to build it.`,
  `Challenges like this reward a clear idea more than fancy features: the best entries usually solve one small problem well. [[coding|Coding]] skills carry over to other languages and other companies' devices too.`]},
 think:`If you could build an app that someone tries in three minutes, what problem would it solve?`,
 quiz:{q:"How long should it take to try an app in this challenge?", a:["3 minutes or less","1 hour","A whole day","10 seconds"], c:0},
 src:[["Apple Developer News, 10 Nov","https://developer.apple.com/news/"]]},

{id:"g-singles", scope:"global", cat:"business", emoji:"🛍️", date:"2026-11-11", kind:"calendar", when:"Today",
 x:{t:`Today is 11.11, the world's biggest shopping day`, b:[
  `In China, 11 November is called Singles' Day, because the date is made of four ones. Online shops offer huge [[discount|discounts]].`,
  `It started in 2009 and is now the biggest online shopping event in the world.`,
  `A smart money tip: before you buy something on sale, ask yourself, "Did I want this before I saw the discount?"`]},
 o:{t:`Singles' Day: how a joke holiday became the world's biggest sale`, b:[
  `Singles' Day began as a tongue-in-cheek celebration for single university students in China, picked because 11/11 is all ones. In 2009 the [[e-commerce|e-commerce]] company Alibaba turned it into a one-day sale, and rivals soon joined in.`,
  `It has since grown into a festival lasting weeks, often starting in mid-October. In 2024, shoppers spent about 1.44 trillion [[yuan|yuan]] (roughly US$200 billion) across the event, according to data firm Syntun. Big platforms no longer publish their own totals.`,
  `Sales events are designed to make people buy quickly. Economists call it impulse buying: countdown clocks and "today only" prices push us to decide before we think. Comparing prices and waiting a day are simple ways to stay in control.`]},
 think:`Have you ever bought something just because it was on sale? Would you buy it again?`,
 quiz:{q:"Why is 11 November called Singles' Day?", a:["The date is made of four ones","It is the first day of winter","Shops open at 11","It celebrates one company"], c:0},
 src:[["Reuters via The Star, Nov 2025","https://www.thestar.com.my/business/business-news/2025/11/12/china039s-singles039-day-shopping-festival-winds-down-with-039muted039-sentiment-sales-expectations"],["Reuters via Tiger Brokers","https://www.itiger.com/news/2582343748"],["Inside Retail","https://insideretail.us/why-chinas-shopping-festival-double-11-shopping-festival-is-losing-its-spark/"]]},


{id:"g-cop31", scope:"global", cat:"planet", emoji:"🌍", date:"2026-11-10", kind:"news",
 x:{t:`World leaders meet to talk about our warming planet`, b:[
  `This week, people from almost 200 countries are meeting in [[antalya|Antalya]], a city by the sea in [[turkiye|Türkiye]]. The meeting is called [[cop|COP31]].`,
  `They are talking about [[climate-change|climate change]], which means Earth is slowly getting warmer. This year brought many heatwaves, floods and wildfires.`,
  `The leader of the [[un|United Nations]] asked countries to get serious about fixing it.`]},
 o:{t:`COP31 opens in Türkiye with a call to get serious`, b:[
  `The UN's yearly climate summit, [[cop|COP31]], opened on 9 November in [[antalya|Antalya]], [[turkiye|Türkiye]], and runs until 20 November, with world leaders gathering on 11 and 12 November. In an unusual setup, Türkiye is hosting while Australia leads the negotiations.`,
  `UN Secretary-General [[guterres|António Guterres]] urged leaders to get serious, saying the world has entered a new age of climate extremes after a year of heatwaves in Europe, wildfires in Indonesia and floods in Nepal.`,
  `A UN report projects about 2.6°C of warming this century even if countries keep their current promises, well above the [[paris-agreement|Paris Agreement]] goal. Organisers call this the implementation COP, focused on turning pledges into action. The United States did not send officials.`]},
 local:{AU:`Australia is leading the negotiations at COP31, even though Türkiye is the host, so Australian diplomats are steering the talks.`, IN:`Delhi's smog this week is a reminder that air and climate are linked: burning less coal and fuel helps clean the air and slow warming at the same time.`, UK:`The UK hosted COP26 in Glasgow in 2021, so British negotiators know how hard these talks can be.`},
 think:`What is one thing your school or home could do to use less energy?`,
 quiz:{q:"Where is COP31 being held?", a:["Antalya, Türkiye","Paris, France","Glasgow, UK","Dubai, UAE"], c:0},
 src:[["Anadolu Agency, 9 Nov","https://aa.com.tr/en/turkiye/cop31-climate-summit-opens-in-turkiye-amid-calls-for-stronger-action/4116474"],["AFP via Khaleej Times, 9 Nov","https://www.khaleejtimes.com/world/cop31-opens-leaders-pressure-tackle-climate-crisis"]]},

{id:"g-sky", scope:"global", cat:"space", emoji:"🌠", date:"2026-11-10", kind:"news", when:"Tonight and next week",
 x:{t:`Look up! Shooting stars and planets this week`, b:[
  `Tonight, 11 November, is a good night to spot shooting stars called the Taurids. Some of them are extra bright [[fireball|fireballs]]!`,
  `On 15 and 16 November, just before sunrise, the planets [[mars|Mars]] and [[jupiter|Jupiter]] will look very close together. Mars looks a little red and Jupiter shines bright.`,
  `On the night of 17 November, the Leonid [[meteor-shower|meteor shower]] reaches its peak. Ask a grown-up to help you find a dark spot!`]},
 o:{t:`Skywatch week: Taurid fireballs, a planet pairing and the Leonids`, b:[
  `The Northern Taurid [[meteor-shower|meteor shower]] peaks tonight, 11 to 12 November. It only produces about five meteors an hour, but the Taurids are known for slow, bright [[fireball|fireballs]], and a thin crescent Moon means dark skies.`,
  `Before dawn on 15 and 16 November, [[mars|Mars]] and [[jupiter|Jupiter]] will appear just over a degree apart, about the width of your little finger held at arm's length. Look for reddish Mars beside brilliant Jupiter.`,
  `Then on the night of 17 to 18 November, the Leonids peak. Their meteors are the fastest of any major shower, hitting the atmosphere at about 71 km per second. No telescope needed: find a dark spot, lie back and give your eyes 30 minutes to adjust.`]},
 think:`Meteors are tiny bits of comet dust. Why do you think they glow when they hit our air?`,
 quiz:{q:"What are the Taurids known for?", a:["Slow, bright fireballs","Appearing in the daytime","Happening only in summer","Being the fastest meteors"], c:0},
 src:[["Space.com","https://space.com/stargazing/meteor-showers/the-taurid-meteor-shower-2026-peaks-tonight-and-fireballs-could-steal-the-show"],["NASA Science: What's Up November 2026","https://science.nasa.gov/?p=1506034"],["Sky at Night Magazine","https://www.skyatnightmagazine.com/advice/stargazing-november-2026"],["Telescope Advisor","https://www.telescopeadvisor.com/night-sky-in-november-2026/"]]},

{id:"g-peace", scope:"global", cat:"world", emoji:"🕊️", date:"2026-11-10", kind:"news", olderOnly:true, sensitive:"conflict",
 x:{t:`Leaders hold talks to try to end a war`, b:[`Grown-ups from three countries are meeting to talk about how to end a war.`]},
 o:{t:`Russia, Ukraine and the US hold peace talks in Abu Dhabi`, b:[
  `Negotiators from [[russia|Russia]], [[ukraine|Ukraine]] and the United States were due to meet on 10 and 11 November in [[abu-dhabi|Abu Dhabi]], capital of the United Arab Emirates. It is their first three-way meeting since February.`,
  `The US is acting as a [[mediator|mediator]] between the two sides, which remain far apart. The talks were expected to focus on security guarantees: promises meant to stop fighting from starting again once it ends.`,
  `Russia launched its full-scale invasion of Ukraine in February 2022. Earlier rounds of talks this year did not produce a deal, so even small steps forward will be watched closely around the world.`]},
 think:`After a long conflict, what could help two sides trust each other's promises?`,
 quiz:{q:"What does a mediator do?", a:["Helps two sides talk and find agreement","Referees a football match","Writes a country's laws","Leads an army"], c:0},
 src:[["Meduza, 10 Nov","https://meduza.io/en/feature/2026/11/10/russia-ukraine-and-the-u-s-to-hold-peace-talks-in-abu-dhabi-on-november-10-their-first-trilateral-meeting-since-february-with-security-issues-expected-to-top-the-agenda"],["News On AIR, 9 Nov","https://newsonair.gov.in/abu-dhabi-to-host-three-way-talks-on-ukraine-conflict/"],["Hürriyet Daily News","https://www.hurriyetdailynews.com/russia-ukraine-us-set-for-peace-talks-229188"]]},

{id:"g-swordfish", scope:"global", cat:"nature", emoji:"🐟", date:"2026-11-09", kind:"news",
 x:{t:`Do swordfish dive deep to find their way?`, b:[
  `Swordfish are big, fast fish with a long pointy bill. Scientists at [[whoi|Woods Hole]] in the United States think swordfish may make deep dives to help them find their way across the huge ocean.`,
  `Swordfish also dive into the dark [[twilight-zone|twilight zone]], far below the surface, to find food.`,
  `The ocean still has so many mysteries!`]},
 o:{t:`Swordfish may use deep dives to navigate the open ocean`, b:[
  `New research from the [[whoi|Woods Hole Oceanographic Institution]] suggests swordfish may use their dramatic deep dives to navigate the open ocean, where there are no landmarks to follow.`,
  `Scientists already knew these fish plunge into the ocean's [[twilight-zone|twilight zone]], a dim layer between 200 and 1,000 m deep, and an earlier study found that tuna and swordfish get around half their food there.`,
  `How big ocean travellers find their way is a long-running puzzle; other animals use Earth's magnetic field, the Sun or even the smell of the water. Understanding these deep habits also matters for protecting the fish as fishing fleets eye the twilight zone.`]},
 think:`How would you find your way in the middle of an ocean with no land in sight?`,
 quiz:{q:"About how deep is the ocean's twilight zone?", a:["0 to 20 m","200 to 1,000 m","5,000 to 10,000 m","1 to 2 m"], c:1},
 src:[["Newswise / WHOI, 9 Nov","https://www.newswise.com/articles/yale-cancer-center-study-shows-new-strategy-to-boost-immune-system-to-fight-melanoma"],["MIT News (background)","https://news.mit.edu/2025/deep-dive-dinners-are-norm-for-tuna-swordfish-0401"]]},

{id:"g-moon", scope:"global", cat:"space", emoji:"🌕", date:"2026-11-08", kind:"news",
 x:{t:`Why everyone wants to visit the Moon's south pole`, b:[
  `Countries are racing to explore the [[moon-south-pole|south pole of the Moon]]. Why there? Deep, dark craters there may hold frozen [[water-ice|water]]!`,
  `Astronauts could one day drink it, or even turn it into air and rocket fuel.`,
  `This week [[nasa|NASA]] announced new projects for its planned Moon Base, and [[china|China]] shared its plans to land astronauts on the Moon too.`]},
 o:{t:`The race to the Moon's south pole speeds up`, b:[
  `[[nasa|NASA]] announced a set of awards on 7 November for transport, technology and science projects to support its planned Moon Base near the [[moon-south-pole|lunar south pole]]. Meanwhile, [[china|China]]'s space programme outlined its roadmap for landing astronauts on the Moon at a symposium in early November.`,
  `Both efforts target the same small region for one big reason: permanently shadowed craters there are thought to hold [[water-ice|water ice]], which could be turned into drinking water, oxygen and rocket fuel.`,
  `NASA aims to land astronauts again in 2028, after a test flight called [[artemis|Artemis III]] in 2027.`]},
 local:{IN:`India's Chandrayaan-3 was the first mission ever to land near the Moon's south pole, in August 2023, and NASA has invited ISRO to join its Moon Base programme.`, US:`NASA is hiring new astronauts right now for this Moon Base. See today's story on how the search works.`, UK:`The UK is a member of the European Space Agency, which builds part of NASA's Orion spacecraft for the Artemis missions.`},
 think:`What would you pack for a month living on the Moon? You can only bring five things.`,
 quiz:{q:"Why is the Moon's south pole so interesting to explorers?", a:["It may have water ice","It is the warmest part of the Moon","It is closest to Earth","It has air to breathe"], c:0},
 src:[["SpaceNexus Lunar Week, 9 Nov","https://spacenexus.us/moon/weekly/week-of-2026-11-09"],["The Week (background)","https://www.theweek.in/news/sci-tech/2026/08/12/nasa-isro-moon-base-program.amp.html"]]},

{id:"g-science", scope:"global", cat:"science", emoji:"🔬", date:"2026-11-10", kind:"calendar", when:"Yesterday",
 x:{t:`Yesterday was World Science Day!`, b:[
  `On 10 November, people around the world celebrated World Science Day for Peace and Development. It reminds us that science helps everyone, from new medicines to cleaner energy.`,
  `The day is organised by [[unesco|UNESCO]], a part of the United Nations that cares about learning, science and culture.`,
  `You are a scientist too, every time you ask why and test an idea!`]},
 o:{t:`World Science Day: why science belongs to everyone`, b:[
  `Every 10 November, [[unesco|UNESCO]] marks World Science Day for Peace and Development, which it set up in 2001. The idea is to remind people that science is not only for laboratories: it shapes the food we grow, the medicines we take and the energy we use.`,
  `The day also points to a challenge: not everyone has the same chance to learn or do science, and UNESCO uses it to call for scientific knowledge to be shared more openly between countries.`,
  `A good way to join in is to try the scientific method yourself: ask a question, make a prediction, test it and see if you were right.`]},
 think:`What is one question about the world you would love to test with an experiment?`,
 quiz:{q:"Which organisation runs World Science Day?", a:["UNESCO","FIFA","NASA","The World Bank"], c:0},
 src:[]},

{id:"g-kindness", scope:"global", cat:"culture", emoji:"💛", date:"2026-11-13", kind:"calendar", when:"Coming up Friday",
 x:{t:`Friday is World Kindness Day`, b:[
  `On 13 November, people around the world celebrate World Kindness Day. The idea is simple: do something kind!`,
  `You could help a friend, say thank you to a teacher, or share a snack.`,
  `Scientists have found that being kind can make the helper feel happy too.`]},
 o:{t:`World Kindness Day: small acts, big ripples`, b:[
  `World Kindness Day falls on Friday, 13 November. It was started in 1998 by the World Kindness Movement, a group of organisations from several countries, to encourage people to look past differences and focus on what we share.`,
  `Psychologists who study kindness have found that helping others can lift the helper's mood as well as the person being helped.`,
  `Try a kindness challenge: one unexpected kind act every day this week, and notice how people react.`]},
 think:`What is the kindest thing someone has done for you? How did it feel?`,
 quiz:{q:"When is World Kindness Day?", a:["13 November","1 January","14 February","5 June"], c:0},
 src:[]}
];


/* Key boxes: one optional, tappable reading aid per story (drafted with the story, approved by the editor) */
const KEYS = {
 "in-air":{type:"number", v:"~400", l:"AQI in Delhi on 9 November: Very poor", scale:"aqi", sel:4},
 "in-chess":{type:"number", v:"24 Nov", l:"the title match starts, and it can run until 12 December"},
 "us-astronauts":{type:"number", v:"8,000+", l:"people applied last time, and only 10 were chosen"},
 "uk-remembrance":{type:"number", v:"2 minutes", l:"of silence at 11 am on Armistice Day"},
 "au-flight":{type:"compare", v:"23,155 km", l:"non-stop, Melbourne to Toulouse", base:23155, items:[["Earth's width",12742,"Almost twice the width of the Earth."],["Delhi to Mumbai",1150,"About 20 Delhi to Mumbai trips in a row."],["Around Earth",40075,"More than half of the way around the planet."]]},
 "au-remembrance":{type:"number", v:"103,000+", l:"names on the Australian War Memorial's Roll of Honour"},
 "kr-snow":{type:"number", v:"12 days", l:"earlier than an average year, and 26 days earlier than last year"},
 "kr-suneung":{type:"number", v:"551,864", l:"people applied to sit this year's exam"},
 "cn-astro":{type:"number", v:"6 months", l:"planned stay on Tiangong; the crew launched on 24 May"},
 "cn-cloud":{type:"number", v:"189 km²", l:"area an AI satellite checked from orbit, even under heavy snow"},
 "de-wall":{type:"timeline", sel:1, items:[["1961","A wall goes up","East Germany builds a wall across Berlin."],["1989","The gates open","On 9 November the crossings open and people celebrate."],["1990","One Germany","East and West Germany join on 3 October."],["2026","Remembered","Roses and candles mark 37 years."]]},
 "de-martin":{type:"spot", items:[["Lanterns","Children carry lanterns they made themselves and sing lantern songs."],["The rider","Someone dressed as St Martin, a Roman soldier, often leads the parade on a horse."],["11:11","At 11:11 am, carnival season opens, with about 30,000 people in costume in Cologne."]]},
 "fr-school":{type:"number", v:"4 days", l:"schools can hold their ceremony up to four days before or after 11 November"},
 "fr-armistice":{type:"timeline", sel:0, items:[["1918","The guns stop","The armistice ends the fighting of the First World War on 11 November."],["1921","The Unknown Soldier","A soldier who was never named is buried beneath the Arc de Triomphe."],["2026","108 years","France marks the anniversary with a national holiday."]]},
 "g-sky":{type:"spot", items:[["Tonight","Taurid fireballs: slow, bright shooting stars on 11 and 12 November."],["15 to 16 Nov","Before dawn, reddish Mars and bright Jupiter appear very close together."],["17 to 18 Nov","The Leonid meteor shower peaks. Find a dark spot and give your eyes time."]]},
 "g-swift":{type:"number", v:"3 min", l:"or less: the time a judge should need to try your app"},
 "g-singles":{type:"number", v:"1.44 trillion", l:"yuan spent across the 2024 festival (about US$200 billion), says data firm Syntun"},
 "g-cop31":{type:"number", v:"~200", l:"countries meeting in Antalya, Türkiye, until 20 November"}
};
const XKEYS = {
 "in-air":{type:"check", q:"Was Delhi's air clean or dirty this week?", a:["Clean","Dirty"], c:1, right:"Right! The air was very dirty.", wrong:"Not quite. Read it again!"},
 "kr-snow":{type:"check", q:"Did the snow come early or late?", a:["Early","Late"], c:0, right:"Right! 12 days early.", wrong:"Not quite. Read it again!"},
 "au-flight":{type:"check", q:"Did the plane stop on the way?", a:["Yes","No"], c:1, right:"Right! It flew all the way without stopping.", wrong:"Not quite. Read it again!"}
};
S.forEach(s=>{ if(KEYS[s.id]) s.key=KEYS[s.id]; if(XKEYS[s.id]) s.xkey=XKEYS[s.id]; });
