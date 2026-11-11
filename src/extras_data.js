/* ===== Extras data: "today" facts, weekly puzzles, Sunday crafts. The daily pipeline writes these; editors approve. ===== */
const ONTHISDAY = {
 "2026-11-11": {
  born: [
   {name:"Maulana Abul Kalam Azad", year:1888, what:"India's first Education Minister. His birthday is National Education Day in India.", where:["IN"]},
   {name:"Fyodor Dostoevsky", year:1821, what:"A Russian writer whose novels are still read all over the world, more than 200 years after he was born."}
  ],
  days: [
   {name:"Armistice Day", what:"The day the First World War ended in 1918. Many countries pause at 11 am to remember.", where:["UK","FR","AU"]},
   {name:"Veterans Day", what:"Americans thank people who served in the armed forces.", where:["US"]},
   {name:"National Education Day", what:"India remembers Maulana Azad and celebrates learning.", where:["IN"]},
   {name:"Farmers' Day", what:"South Korea thanks its farmers on 11/11. The same date is also Pepero Day, when friends swap stick-shaped snacks.", where:["KR"]},
   {name:"St Martin's Day", what:"Lantern parades for children, and the start of carnival season at 11:11.", where:["DE"]}
  ],
  week: "World Kindness Day is this Friday, 13 November."
 }
};

/* Weekly puzzles: one set per week (Monday date). Sudoku has a single solution; words come from that week's stories. */
const PUZZLES = {
 "2026-11-09": {
  sudoku: {
   o:{n:6, br:2, bc:3, p:[[2,0,5,6,3,0],[0,1,0,5,4,0],[0,0,4,1,0,5],[0,0,0,0,0,0],[0,0,0,3,0,6],[5,6,0,0,0,0]], s:[[2,4,5,6,3,1],[3,1,6,5,4,2],[6,3,4,1,2,5],[1,5,2,4,6,3],[4,2,1,3,5,6],[5,6,3,2,1,4]]},
   n:{n:9, br:3, bc:3, p:[[0,7,0,9,4,0,0,0,0],[6,0,2,0,0,7,0,0,8],[0,8,9,2,0,0,0,1,0],[0,6,7,0,1,5,0,0,4],[0,5,0,3,0,4,2,7,0],[0,0,3,0,2,0,0,0,0],[0,9,0,5,0,0,0,0,1],[7,0,5,0,8,0,0,0,0],[8,0,4,0,3,9,0,5,0]], s:[[5,7,1,9,4,8,6,2,3],[6,3,2,1,5,7,4,9,8],[4,8,9,2,6,3,5,1,7],[2,6,7,8,1,5,9,3,4],[1,5,8,3,9,4,2,7,6],[9,4,3,7,2,6,1,8,5],[3,9,6,5,7,2,8,4,1],[7,2,5,4,8,1,3,6,9],[8,1,4,6,3,9,7,5,2]]},
   x:{n:4, br:2, bc:2, p:[[1,0,0,3],[0,0,0,0],[0,0,3,4],[3,4,0,2]], s:[[1,2,4,3],[4,3,2,1],[2,1,3,4],[3,4,1,2]]}
  },
  words: {
   o:[["ARMISTICE","An agreement to stop fighting (11 November 1918)"],["SATELLITE","China wants these to do computing in space"],["ASTRONAUT","NASA is looking for new ones"],["LANTERN","German children carry one on St Martin's Day"],["DISCOUNT","Money taken off the usual price"]],
   x:[["SNOW","It fell early in Seoul"],["MOON","NASA wants a base near its south pole"],["COMET","Taurid fireballs come from one"],["PLANE","It flew from Australia to France without stopping"],["POPPY","A red flower for Remembrance Day"]]
  }
 }
};

/* Sunday crafts for year one: 52 Sundays from 15 November 2026 to 7 November 2027. g = needs a grown-up's help (scissors, needles, glue guns, ovens). */
const CRAFT_START = "2026-11-15";
const CRAFTS = [
 {t:"Paper lantern", th:"Lights festivals around the world", m:["Coloured paper","Scissors","Glue or tape","A battery tea light"], s:["Fold an A4 sheet in half lengthwise.","Cut slits from the fold, stopping 2 cm from the edge.","Unfold, roll into a tube and glue the ends.","Add a paper handle and put the battery light inside."], g:1},
 {t:"Leaf-print bookmark", th:"Autumn leaves (spring in the south)", m:["Fresh leaves","Paint","Card strip","Ribbon"], s:["Paint the back of a leaf with a thin coat.","Press it onto the card strip and lift carefully.","Let it dry, then punch a hole.","Tie on a ribbon."], g:0},
 {t:"Fold-and-play chessboard", th:"The World Chess Championship", m:["Square card","Ruler","Black marker","Bottle caps for pieces"], s:["Draw an 8 by 8 grid of equal squares.","Colour every other square.","Write piece letters on 32 bottle caps.","Fold the board in half to carry it."], g:0},
 {t:"Paper snowflakes", th:"Seoul's early snow", m:["Thin white paper","Scissors"], s:["Cut a square and fold it into a triangle three times.","Snip small shapes along the edges.","Unfold slowly.","Hang them in a window."], g:1},
 {t:"Constellation viewer", th:"Meteor showers and winter skies", m:["Paper cup","Pin or pencil","Star map"], s:["Copy a constellation onto the base of the cup.","Ask a grown-up to poke holes at each star.","Look through the cup at a bright window.","Try to find it in the real sky tonight."], g:1},
 {t:"Recycled-paper cards", th:"Year-end greetings", m:["Old magazines","Card","Glue stick"], s:["Cut shapes and letters from old paper.","Plan a picture before gluing.","Stick it onto folded card.","Write a kind message inside."], g:1},
 {t:"Memory jar", th:"Looking back at the year", m:["Clean jar","Paper slips","Pens"], s:["Write one good memory on each slip.","Fold the slips and fill the jar.","Decorate the lid.","Open it together next December."], g:0},
 {t:"Goals wheel", th:"New year, new goals", m:["Paper plate","Split pin","Card arrow","Pens"], s:["Divide the plate into six parts.","Write a small goal in each part.","Fix the arrow in the middle with the pin.","Spin it each Monday to pick a goal."], g:0},
 {t:"Diamond kite", th:"Kite festivals in mid-January", m:["Two straws or light sticks","Paper","Tape","String"], s:["Tape the sticks into a cross.","Cut a diamond of paper to fit and tape it on.","Add a paper tail.","Tie string to the cross and fly it in an open space, away from power lines."], g:1},
 {t:"Bird feeder roll", th:"Helping birds in winter", m:["Cardboard tube","Peanut-free seed butter or lard","Bird seed","String"], s:["Spread the butter thinly over the tube.","Roll it in bird seed.","Thread string through and tie a loop.","Hang it from a branch and watch who visits."], g:0},
 {t:"Pinwheel in your country's colours", th:"National days in late January", m:["Square paper","Pencil with eraser","Pin","Colours"], s:["Colour both sides in your flag's colours.","Cut from each corner towards the middle, stopping halfway.","Fold every other point to the centre.","Ask a grown-up to pin it to the eraser."], g:1},
 {t:"Rain gauge", th:"Weather and climate", m:["Plastic bottle","Ruler","Tape","Pebbles"], s:["Ask a grown-up to cut the top off the bottle.","Put pebbles in the bottom and flip the top in as a funnel.","Tape a ruler to the side.","Check it every day and keep a chart."], g:1},
 {t:"Accordion dragon puppet", th:"Lunar New Year", m:["Two paper strips","Card for the head","Sticks","Glue"], s:["Fold two strips over each other to make a springy body.","Draw and cut a dragon head and tail.","Glue them to each end.","Tape a stick under each end and make it dance."], g:1},
 {t:"Kindness cards", th:"Sharing kindness", m:["Small cards","Pens","Envelopes"], s:["Write a short, specific thank-you on each card.","Decorate the front.","Put them in envelopes.","Leave them for family, friends or neighbours."], g:0},
 {t:"Many-scripts bookmark", th:"International Mother Language Day", m:["Card strip","Pens"], s:["Find how to write 'hello' in five languages.","Copy each one neatly onto the strip.","Add the name of each language.","Ask family which other languages they know."], g:0},
 {t:"Balloon rocket", th:"National Science Day in India", m:["Balloon","Straw","Long string","Tape"], s:["Thread the string through the straw and tie it across a room.","Blow up the balloon and hold the end shut.","Tape it under the straw.","Let go and measure how far it zooms."], g:0},
 {t:"Hero portrait frame", th:"Women's Day", m:["Card","Pens","Photo or drawing"], s:["Choose a woman who inspires you.","Draw her or print a photo.","Make a frame with three facts about her.","Share why you chose her."], g:0},
 {t:"Colour wheel spinner", th:"The science of colour", m:["Card circle","Colours","Pencil"], s:["Divide the circle into seven parts.","Colour them like a rainbow.","Push a pencil through the centre.","Spin fast and watch the colours blend."], g:1},
 {t:"Bottle water filter", th:"World Water Day", m:["Plastic bottle","Cotton wool","Sand","Gravel","Muddy water"], s:["Ask a grown-up to cut the bottle in half.","Layer cotton, sand and gravel in the top half, upside down.","Pour muddy water through slowly.","Compare it with the start. It is still not safe to drink."], g:1},
 {t:"Shadow puppet theatre", th:"Earth Hour: lights off for an hour", m:["Card","Sticks","Tape","Torch"], s:["Cut animal shapes from card.","Tape each to a stick.","Shine a torch at a wall.","Tell a story with the lights off."], g:1},
 {t:"Seed bombs", th:"Spring planting", m:["Clay or compost","Native flower seeds","Water"], s:["Mix the clay and compost with a little water.","Add a pinch of seeds.","Roll into small balls.","Let them dry, then plant them in a pot or garden."], g:0},
 {t:"Paper plate solar system", th:"Our planets", m:["Paper plate","Paints","String","Small paper circles"], s:["Paint the Sun in the middle.","Make eight planet circles in different sizes.","Hang them from the plate with string in the right order.","Say the planets aloud as you go."], g:0},
 {t:"Cardboard monument", th:"World Heritage Day", m:["Boxes","Tubes","Tape","Paint"], s:["Pick a famous monument.","Study a photo of its shape.","Build it from boxes and tubes.","Paint it and add a fact card."], g:0},
 {t:"Upcycled pencil holder", th:"Earth Day", m:["Tin or tube","Scrap paper","Glue"], s:["Check the tin has no sharp edges.","Cover it with scrap paper.","Decorate with a pattern.","Use it on your desk."], g:1},
 {t:"Origami jumping frog", th:"Paper folding", m:["Square paper"], s:["Fold the top into a triangle point.","Fold the sides to make front legs.","Fold the bottom up and back into a spring.","Press its back and let it jump."], g:0},
 {t:"Paper sundial", th:"Telling time with the Sun", m:["Paper plate","Pencil","Pen"], s:["Push a pencil upright through the plate's centre.","Put it in a sunny spot.","Mark the shadow every hour.","Check if it works tomorrow."], g:0},
 {t:"Balloon car", th:"How engines push", m:["Small box","Straws","Bottle caps","Skewers","Balloon"], s:["Make two axles from skewers and caps.","Tape them under the box.","Tape a balloon to a straw pointing backwards.","Blow it up and let it race."], g:1},
 {t:"Paper turtle", th:"World Turtle Day", m:["Paper bowl","Green card","Paints"], s:["Paint the bowl like a shell.","Cut a head, legs and tail from card.","Glue them under the bowl.","Find out which turtles live near you."], g:1},
 {t:"Flower press", th:"Plants and seasons", m:["Heavy books","Paper towels","Flowers"], s:["Pick a few fallen flowers or leaves.","Place them between paper towels.","Stack heavy books on top.","Check after a week."], g:0},
 {t:"Decorated cloth bag", th:"World Environment Day", m:["Plain cloth bag","Fabric pens"], s:["Plan a design on paper.","Draw it onto the bag.","Let it dry.","Use it instead of plastic bags."], g:0},
 {t:"Paper plane challenge", th:"The longest-ever passenger flight", m:["A4 paper","Tape measure"], s:["Fold three different plane designs.","Throw each one three times.","Measure and write down the distances.","Improve the best one."], g:0},
 {t:"Sun catcher", th:"The longest day of the year (north)", m:["Clear sticky film","Tissue paper","Card frame"], s:["Cut tissue into small pieces.","Stick them on the film.","Frame it with card.","Hang it in a sunny window."], g:1},
 {t:"Floating compass", th:"How magnets work", m:["Sewing needle","Magnet","Cork slice","Bowl of water"], s:["Ask a grown-up to stroke the needle with the magnet 30 times in one direction.","Lay it on the cork.","Float it in the bowl.","Watch it turn to point north."], g:1},
 {t:"Cardboard marble run", th:"Engineering", m:["Tubes","Tape","A box","Marble"], s:["Cut tubes in half lengthwise.","Tape them inside the box as slopes.","Test with a marble.","Add a twist or a jump."], g:1},
 {t:"Family tree poster", th:"World Population Day", m:["Large paper","Photos or drawings","Pens"], s:["Ask family about grandparents and great-grandparents.","Draw a tree.","Add names on the branches.","Write one story about each person."], g:0},
 {t:"Moon phase flip book", th:"The first Moon landing", m:["Small paper squares","Stapler","Pencil"], s:["Draw the Moon on each page, a bit fuller each time.","Put the pages in order.","Staple them at one edge.","Flip and watch the Moon change."], g:0},
 {t:"Rain cloud in a jar", th:"How rain forms", m:["Jar","Water","Shaving foam","Food colouring"], s:["Fill the jar with water.","Top it with a foam cloud.","Drip colouring onto the foam.","Watch it 'rain' through."], g:0},
 {t:"Friendship bracelet", th:"Friendship Day", m:["Embroidery thread","Tape"], s:["Cut three threads.","Tape them to a table.","Braid them tightly.","Tie it on a friend's wrist."], g:0},
 {t:"Paper plate animal mask", th:"International Tiger Day", m:["Paper plate","Paint","Elastic"], s:["Cut eye holes with a grown-up.","Paint a tiger face.","Add card ears.","Attach elastic."], g:1},
 {t:"Country map puzzle", th:"Independence and national days", m:["Printed map","Card","Glue"], s:["Glue the map onto card.","Cut it into regions.","Mix up the pieces.","Time yourself putting it back."], g:1},
 {t:"Funnel stethoscope", th:"How sound travels", m:["Funnel","Rubber tube","Tape"], s:["Fit the tube onto the funnel.","Tape it tight.","Hold the funnel to a friend's chest.","Listen for their heartbeat."], g:0},
 {t:"Shoebox table football", th:"National Sports Day in India", m:["Shoebox","Skewers","Clothes pegs","Ping-pong ball"], s:["Ask a grown-up to poke holes for the skewers.","Clip pegs on the skewers as players.","Cut goals at each end.","Play a match."], g:1},
 {t:"Pop-up thank-you card", th:"Teachers' Day", m:["Card","Scissors","Pens"], s:["Fold card in half.","Cut two short slits at the fold and push the tab inside.","Glue a drawing to the tab.","Write a thank-you for a teacher."], g:1},
 {t:"Pop-up book page", th:"Reading and stories", m:["Card","Scissors","Glue"], s:["Pick a scene from a favourite story.","Make a pop-up tab.","Glue the scene on it.","Write one line underneath."], g:1},
 {t:"Leaf rubbings", th:"Changing seasons", m:["Leaves","Thin paper","Crayons"], s:["Put a leaf under the paper.","Rub sideways with a crayon.","Try different leaves.","Label each tree."], g:0},
 {t:"Paper bridge test", th:"How bridges stay strong", m:["Paper","Two books","Coins"], s:["Lay a flat paper bridge between books and add coins.","Count how many it holds.","Fold the paper into a zigzag and try again.","Which shape is strongest?"], g:0},
 {t:"Straw rocket", th:"World Space Week", m:["Paper","Straw","Tape"], s:["Roll paper around a pencil into a tube.","Close one end with tape.","Add fins.","Slip it on a straw and blow."], g:0},
 {t:"Decorated clay lamp", th:"Festival of lights", m:["Clay lamp","Paints","Glitter glue"], s:["Wipe the lamp clean.","Paint a pattern.","Add dots of glitter glue.","Let a grown-up light it."], g:1},
 {t:"Origami crane", th:"A symbol of peace", m:["Square paper"], s:["Fold a square base.","Fold the petal fold on both sides.","Fold the neck and tail up.","Gently pull the wings open."], g:0},
 {t:"Flags of the world bunting", th:"United Nations Day", m:["Paper triangles","String","Colours"], s:["Pick ten countries.","Draw a flag on each triangle.","Fold the tops over the string and tape.","Hang it and quiz your family."], g:0},
 {t:"Bottle-cap mosaic", th:"Art from recycling", m:["Bottle caps","Card","Glue"], s:["Sort caps by colour.","Sketch a simple picture.","Glue caps on to fill it.","Display your mosaic."], g:0},
 {t:"One-year scrapbook", th:"A year of FFMPA", m:["Notebook","Printouts or drawings","Glue"], s:["Pick your favourite stories from the year.","Draw or write one thing you learned from each.","Glue in your crafts photos.","Show it to someone who will be proud of you."], g:0}
];

/* One new thing a day: a short history, geography or science concept, linked to the news where possible. */
const LEARN = {
 "2026-11-11": {subject:"Science", cat:"science", link:"From the sky story",
  x:{t:"Why do shooting stars glow?", b:["A shooting star is not a star. It is a tiny bit of space rock, often smaller than a pea.","It hits the air around Earth super fast and squashes the air in front of it. Squashed air gets very, very hot.","The heat makes the rock and the air glow. That bright streak is what you see!"], remember:"Shooting stars are tiny rocks that glow because they squash the air so fast it gets hot.", q:"What is a shooting star really?", a:["A tiny space rock","A falling star"], c:0},
  o:{t:"Why do shooting stars glow?", b:["A meteor starts as a meteoroid: a bit of rock or dust in space, often no bigger than a grain of sand. It hits Earth's atmosphere at tens of kilometres per second.","At that speed it squeezes the air in front of it so quickly that the air heats to thousands of degrees. The heat makes the air glow and boils the rock away, usually 70 to 100 km above the ground.","Three words to keep straight: a meteoroid is the rock in space, a meteor is the streak of light, and a meteorite is any piece that survives and lands."], remember:"It is mostly squeezed, heated air that glows, not the rock 'burning' like a match.", q:"What is a piece that lands on the ground called?", a:["Meteor","Meteorite","Meteoroid"], c:1}}
};
const LEARN_WEEK = [["Mon 9 Nov","History","Why did a wall divide Berlin?"],["Tue 10 Nov","Geography","Why is winter air worse in north India?"],["Wed 11 Nov","Science","Why do shooting stars glow?"],["Thu 12 Nov","History","What was the First World War?"],["Fri 13 Nov","Geography","Why are there time zones?"],["Sat 14 Nov","Science","How does a plane stay up for 24 hours?"],["Sun 15 Nov","History","Who invented chess?"]];

/* ===== Hidden finds data ===== */
const SECRETS=[
 {t:"Two sources, always", b:"A reporter does not print something just because one person said it. They look for a second person or paper that says the same thing. If only one place says it, it is not news yet.", try:"Next time a friend tells you something amazing, ask: who else says so?"},
 {t:"Read past the headline", b:"A headline is only a few words, so it can never tell the whole story. Reporters know that the important details sit lower down.", try:"Pick one story today and find a fact in the text that the headline left out."},
 {t:"Who is speaking?", b:"Reporters always ask who is telling them something and why. A company talking about its own toy will sound different from a child who played with it.", try:"In today's stories, spot one person or group who is quoted. What might they want you to think?"},
 {t:"Fact or opinion?", b:"A fact can be checked: it rained 20 mm. An opinion is what someone thinks: it was horrible weather. News uses facts. Opinions must be labelled.", try:"Say one fact and one opinion about your breakfast."},
 {t:"Numbers need a friend", b:"A number alone tells you little. 400 sounds big, but 400 what, and compared with what? Good reporters always give a number something to stand next to.", try:"Find a number in today's edition. What is it compared with?"},
 {t:"Old photos travel", b:"Pictures get shared again and again, sometimes years later with a new and wrong story attached. Newsrooms check when and where every photo was taken.", try:"Look at a photo credit in FFMPA. It tells you who took the picture."},
 {t:"Good newsrooms say sorry", b:"Everyone makes mistakes, even reporters. A newsroom you can trust fixes the mistake and tells you it did. Hiding a mistake is the real problem.", try:"If you got something wrong today, try saying: I was wrong, here is the right answer."}
];
const HIDDEN_WORDS={
 "2026-11-11":[
  {k:"satellite", o:"Satellite comes from the Latin word satelles, which meant a guard who walked beside an important person. In 1610 the astronomer Johannes Kepler borrowed it for the moons that travel beside Jupiter. Today it also means the machines we send up to travel beside Earth."},
  {k:"astronaut", o:"Astronaut is built from two Greek words: astron, meaning star, and nautes, meaning sailor. An astronaut is a star sailor."},
  {k:"smog", o:"Smog is two words squeezed together: smoke and fog. It was first used in London in 1905 to describe the thick, dirty air over the city."},
  {k:"mediator", o:"Mediator comes from the Latin word medius, meaning middle. A mediator stands in the middle between two sides and helps them talk."}
 ]
};
const HELLOS=[
 {w:"Namaste", say:"nuh-muh-stay", lang:"Hindi", code:"hi-IN", speak:"नमस्ते", where:["IN"], note:"Said with palms pressed together. It means: I bow to you."},
 {w:"Hello", say:"heh-loh", lang:"English", code:"en-GB", where:["US","UK"], note:"Hello only became the everyday greeting when telephones spread in the 1880s. People needed a word to start a call."},
 {w:"G'day", say:"guh-day", lang:"Australian English", code:"en-AU", where:["AU"], note:"Short for good day. Australians love to shorten words."},
 {w:"Annyeonghaseyo", say:"an-nyong-ha-say-yo", lang:"Korean", code:"ko-KR", speak:"안녕하세요", where:["KR"], note:"Written 안녕하세요. It asks: are you at peace?"},
 {w:"Guten Tag", say:"goo-ten tahk", lang:"German", code:"de-DE", where:["DE"], note:"It means good day. Friends often just say Hallo."},
 {w:"Bonjour", say:"bon-zhoor", lang:"French", code:"fr-FR", where:["FR"], note:"Bon means good and jour means day. After dark it becomes bonsoir."}
];
const BACKTHEN={
 "11-11":{y:1930, t:"Einstein gets a patent for a fridge",
  o:"On this day Albert Einstein and his former student Leo Szilard were granted a United States patent for a refrigerator. It had no moving parts, so there was nothing to break and leak. They began the work after reading a newspaper report about a family harmed by gas escaping from a faulty fridge.",
  x:"Albert Einstein was a very famous scientist. On this day he and his friend Leo Szilard were given a patent for a new kind of fridge. A patent is a paper that says: this idea is ours. Their fridge had no moving parts, so it was safer.",
  why:"The idea began with a news story. Reading the news made two scientists want to fix a problem. That is what news is for."}
};

/* ===== Sketch explainers: hand-drawn, step by step. Each step adds to the drawing. =====
   Shapes on a 320 x 220 board: l line, r box, c circle, p free path, a arrow, t label. acc:1 uses the topic colour. */
const SKETCHES={
 smog:{t:"Why smog gets trapped", c:"#0B7F75", steps:[
  {o:"Cars, factories, farm fires and firecrackers all put smoke into the air.", x:"Cars, fires and firecrackers put smoke into the air.", d:[
   {l:[8,192,312,192]},{r:[28,152,40,40]},{p:"M24 152 L48 132 L72 152"},{r:[92,118,30,74]},{l:[100,132,114,132]},{l:[100,148,114,148]},{l:[100,164,114,164]},
   {r:[158,172,46,14]},{p:"M166 172 L172 162 L192 162 L198 172"},{c:[170,188,5]},{c:[192,188,5]},
   {r:[246,128,16,64]},{r:[262,160,34,32]},
   {p:"M254 122 q-9 -9 0 -18 q9 -9 0 -18",acc:1},{p:"M210 176 q8 -6 14 -2 q6 4 12 -2",acc:1},{t:[268,100,"smoke"],acc:1}]},
  {o:"On cold, still nights a layer of warm air settles above the city and acts like a lid.", x:"On cold, still nights, warm air sits on top like a lid.", d:[
   {p:"M12 66 q19 -9 38 0 t38 0 t38 0 t38 0 t38 0 t38 0 t38 0 t30 0"},{t:[96,52,"warm air lid"]},
   {a:[254,84,254,72],acc:1},{l:[246,70,262,70]},{t:[20,112,"cold air"]}]},
  {o:"The smoke cannot rise, so it spreads sideways and builds up as smog. Wind or rain is what finally clears it.", x:"The smoke is stuck. It spreads out and becomes smog. Wind or rain clears it.", d:[
   {p:"M22 86 q16 -7 32 0 t32 0 t32 0 t32 0 t32 0 t32 0 t32 0 t32 0",acc:1},{p:"M34 98 q16 -7 32 0 t32 0 t32 0 t32 0 t32 0 t32 0 t32 0",acc:1},{p:"M140 110 q16 -7 32 0 t32 0 t32 0 t32 0",acc:1},
   {t:[150,82,"smog"],acc:1},{a:[306,28,262,28]},{a:[306,40,270,40]},{t:[212,22,"wind"]}]}
 ]},
 meteor:{t:"Why shooting stars glow", c:"#25317F", steps:[
  {o:"A bit of space rock, often smaller than a pea, speeds towards Earth.", x:"A tiny space rock, smaller than a pea, flies towards Earth.", d:[
   {p:"M0 204 Q160 156 320 204"},{t:[138,212,"Earth"]},{p:"M0 150 Q160 102 320 150",acc:1},{t:[14,138,"air"],acc:1},
   {c:[276,28,5]},{a:[266,36,236,58]},{t:[196,22,"space rock"]}]},
  {o:"It hits the air at tens of kilometres per second and squeezes the air in front of it. Squeezed air gets extremely hot.", x:"It hits the air super fast and squashes it. Squashed air gets very hot.", d:[
   {c:[196,92,5]},{p:"M180 86 Q176 106 194 110",acc:1},{p:"M172 82 Q166 110 192 118",acc:1},
   {t:[40,96,"squeezed, hot air"],acc:1},{a:[150,98,170,100],acc:1}]},
  {o:"The heat makes the air and the rock glow, usually 70 to 100 km up. From the ground you see a bright streak.", x:"The hot air and rock glow. From the ground you see a bright streak!", d:[
   {l:[268,36,204,86],acc:1},{l:[274,44,210,92],acc:1},{l:[262,30,200,78],acc:1},
   {c:[62,150,6]},{l:[62,156,62,174]},{l:[62,174,55,186]},{l:[62,174,69,186]},{l:[62,162,76,150]},{t:[84,146,"look!"]}]}
 ]},
 orbit:{t:"How a satellite stays up", c:"#6B35D8", steps:[
  {o:"Throw a ball from a tall tower and gravity curves it down to the ground.", x:"Throw a ball. It curves down and lands.", d:[
   {c:[160,122,54]},{t:[142,128,"Earth"]},{l:[160,68,160,54]},{l:[154,54,166,54]},
   {p:"M162 54 Q186 54 196 80",acc:1},{t:[172,40,"throw"]}]},
  {o:"Throw it faster and it lands further away, because the ground curves away beneath it while it falls.", x:"Throw it faster. It lands further away, because Earth is round.", d:[
   {p:"M162 54 Q224 58 214 118",acc:1},{t:[228,62,"faster"]}]},
  {o:"At about 28,000 km an hour it falls around Earth and never lands. That endless fall is an orbit, and it is how satellites stay up.", x:"Go fast enough and it keeps falling around Earth without landing. That is an orbit!", d:[
   {c:[160,122,68],acc:1},{r:[223,117,10,10]},{l:[215,122,223,122]},{l:[233,122,241,122]},{t:[246,110,"satellite"]},{t:[44,56,"orbit"],acc:1}]}
 ]},
 greenhouse:{t:"Why the planet is warming", c:"#0B7F75", steps:[
  {o:"Sunlight passes through the air and warms the land and the sea.", x:"Sunlight comes down and warms the Earth.", d:[
   {p:"M0 202 Q160 162 320 202"},{t:[140,212,"Earth"]},{c:[46,42,17]},{l:[46,14,46,6]},{l:[20,42,10,42]},{l:[27,23,20,16]},{l:[65,23,72,16]},{l:[27,61,20,68]},
   {a:[68,58,118,162],acc:1},{a:[78,48,160,150],acc:1},{t:[122,92,"sunlight"],acc:1}]},
  {o:"The warm Earth sends heat back up. Much of it escapes into space, which keeps the planet from overheating.", x:"The warm Earth sends heat back up into space.", d:[
   {p:"M214 160 q-9 -11 0 -22 q9 -11 0 -22 q-9 -11 0 -22"},{a:[214,94,214,70]},{t:[176,58,"heat escapes"]}]},
  {o:"Gases such as carbon dioxide, from burning coal, oil and gas, act like a blanket. They trap more of the heat, so the planet slowly warms.", x:"Gases from burning coal, oil and gas act like a blanket. They keep more heat in, so Earth gets warmer.", d:[
   {p:"M150 112 q18 -9 36 0 t36 0 t36 0 t36 0 t22 0",acc:1},{p:"M158 124 q18 -9 36 0 t36 0 t36 0 t36 0",acc:1},{t:[226,104,"gas blanket"],acc:1},
   {p:"M268 162 Q262 142 272 132",acc:1},{a:[274,132,292,160],acc:1},{t:[236,182,"trapped heat"],acc:1}]}
 ]}
};
const SKETCH_FOR={"g-cop31":"greenhouse","in-air":"smog","g-sky":"meteor","learn:2026-11-11":"meteor","cn-cloud":"orbit"};


/* ===== Big Story of the week: one topic followed all week. Written by the pipeline, approved by an editor. ===== */
const BIGSTORY={
 "2026-11-09":{story:"g-cop31", cat:"planet", sketch:"greenhouse",
  t:"Can the world agree to slow climate change?", sub:"COP31, the United Nations climate summit in Türkiye",
  x:{why:"Almost 200 countries are in one place to decide how to stop Earth getting too warm. What they agree will shape the world you grow up in."},
  o:{why:"Almost 200 countries are in one place to decide how to turn climate promises into action. What they agree, or fail to agree, will shape the world you grow up in."},
  facts:[["~200","countries taking part"],["1.5°C","the limit countries hope to keep to"],["2.6°C","where current promises lead, says a UN report"],["20 Nov","the day the talks are due to end"]],
  days:[
   {d:"2026-11-09", h:"The summit opens", o:"COP31 opened in Antalya, a city on Türkiye's coast. In an unusual setup, Türkiye is the host while Australia leads the negotiations.", x:"The big meeting began in Antalya, a city by the sea in Türkiye. Türkiye is the host, and Australia is leading the talks."},
   {d:"2026-11-10", h:"A warning from the UN", o:"UN Secretary-General António Guterres urged leaders to get serious. A UN report projects about 2.6°C of warming this century on current promises, well above the Paris Agreement goal.", x:"The leader of the United Nations asked every country to get serious. A report says Earth is on track to warm more than countries promised."},
   {d:"2026-11-11", h:"World leaders arrive", o:"Leaders gather today and tomorrow. Organisers call this the implementation COP: less about new promises, more about keeping old ones. The United States did not send officials.", x:"Presidents and prime ministers arrive today. This meeting is about keeping old promises, and less about making new ones."},
   {d:"2026-11-12", h:"What do leaders promise?", lock:"Thursday: the second day of leaders' speeches. Listen for numbers and dates, not just nice words."},
   {d:"2026-11-13", h:"The week in one page", lock:"Friday: what moved, what did not, and what to watch in week two."}
  ],
  words:["cop","climate-change","paris-agreement","un"],
  poll:{q:"If you were a leader at COP31, what would you push for first?", a:[["Cleaner energy","Most warming comes from burning coal, oil and gas for energy, so this is where the biggest cuts are."],["Protecting forests","Trees take carbon dioxide out of the air, and forests are home to most land animals."],["Helping places hit by floods and heat","Poorer countries have done the least to cause warming and are often hit hardest."],["Cleaner transport","Cars, lorries, ships and planes burn a lot of fuel. Electric and shared travel cut that."]]},
  talk:"Is it fair to ask every country to cut pollution by the same amount? Why, or why not?"
 }
};

/* ===== Young reporters: one assignment a week. Reports need a grown-up's PIN and an editor's approval. ===== */
const YR={
 "2026-11-09":{t:"Report one kind thing you saw this week", why:"World Kindness Day is on Friday 13 November. The best reports appear on Sunday's front page.",
  tips:["Who did it?","What did they do?","Where did it happen?"],
  sample:[
   {h:"Shopkeeper keeps a free water pot outside all summer", b:"People walking past stop to drink. He fills it three times a day.", by:"Reader, 10, India"},
   {h:"Year 4 class writes thank-you cards for the school cleaners", b:"Every child wrote one line. The cards were left on the cleaning trolley.", by:"Reader, 9, United Kingdom"},
   {h:"Neighbour teaches four children to ride bikes on Sunday mornings", b:"She brings her own tools and fixes the chains too.", by:"Reader, 12, Australia"}
  ]}
};


/* ===== Navigators (13 to 15): a deeper layer on every story. Thinkers text plus context, a question worth arguing about and the jobs behind the story. ===== */
const DEEP={
 "in-air":{ctx:"Delhi's winter smog returns every year because of geography as well as pollution: the city sits on a plain with the Himalayas to the north, and cool, still air traps whatever is emitted. Studies that split the sources find vehicles, industry, dust and household fuel matter all year, while farm fires and fireworks add sharp peaks.",ask:"Emergency bans treat the worst days. Should the money go to year-round fixes such as cleaner transport and farm machinery, even if results take years?",jobs:["Atmospheric scientist","Public health doctor","Urban planner"]},
 "in-diyas":{ctx:"Large festivals are also big economies: potters, flower sellers, hotels and transport all depend on them, and cities compete to host record-setting events.",ask:"When a celebration grows into a record attempt, who gains most: worshippers, local workers or the city's image? Can it be all three?",jobs:["Event manager","Heritage conservator","Tourism economist"]},
 "in-chess":{ctx:"Elite chess has been reshaped by computers. Players prepare with engines far stronger than any human, so matches are often decided by deep preparation, stamina and nerves. India's rise follows a generation inspired by Viswanathan Anand and by cheap online training.",ask:"If an engine can always find a better move, what exactly are we admiring when two humans play?",jobs:["Sports psychologist","Data analyst","Chess coach"]},
 "in-childrens":{ctx:"Nehru's India chose to spend scarce money on universities and science institutes at a time when most adults could not read. Critics then and now argue that primary schooling deserved more of it.",ask:"Should a poor country build world-class colleges first, or basic schools for everyone first?",jobs:["Education policy researcher","Teacher","Historian"]},
 "us-astronauts":{ctx:"Astronaut selection favours people who are already expert at something else: pilots, engineers, doctors, scientists. Most applicants are turned down several times. The Moon programme also depends on private companies building landers and on budgets that Congress votes on every year.",ask:"Human spaceflight costs far more than robots that can do much of the science. What do people add that justifies the price?",jobs:["Aerospace engineer","Flight surgeon","Geologist"]},
 "us-veterans":{ctx:"How a country treats former soldiers is a live policy question as well as a ceremony: health care, housing and jobs for veterans are argued over in most budgets.",ask:"Is a day of thanks enough, or does honouring service mean paying for long-term care too?",jobs:["Military historian","Social worker","Nurse"]},
 "uk-remembrance":{ctx:"Remembrance began as mourning for the First World War and has had to stretch to cover later, more disputed conflicts. Some people wear a white poppy for peace, or none at all, and the argument about whether the poppy is remembrance or politics returns most years.",ask:"Can a nation remember its war dead without also judging whether each war was right?",jobs:["Archivist","Diplomat","Museum curator"]},
 "uk-cin":{ctx:"Telethons raise large sums in one night, but charities say steady monthly giving is what lets them plan. Some campaigners also ask why services for children depend on donations at all.",ask:"Should help for children in need rely on charity nights, or is that the government's job?",jobs:["Charity fundraiser","Youth worker","Broadcast producer"]},
 "au-flight":{ctx:"Ultra-long flights save a stopover, but they must carry so much fuel that part of it is burned just to carry the rest. Aviation produces roughly 2 to 3 per cent of the world's carbon dioxide emissions, and cleaner fuels are still scarce and costly.",ask:"Is a non-stop flight lasting about a day progress, or a step the climate cannot afford?",jobs:["Aeronautical engineer","Airline pilot","Sustainable fuel chemist"]},
 "au-remembrance":{ctx:"War memorials are also museums, and what they choose to show changes over time. Historians argue over how much space such places should give to uncomfortable chapters alongside stories of courage.",ask:"Should a war memorial only honour, or should it also question?",jobs:["Curator","Conservator","Historian"]},
 "kr-snow":{ctx:"One early snowfall is weather, not climate. Climate is the pattern over decades, and scientists look at long records before saying anything has changed. A single surprising day proves nothing either way.",ask:"Why do people find one cold snap or one heatwave more convincing than thirty years of data?",jobs:["Meteorologist","Climate data scientist","Science journalist"]},
 "kr-suneung":{ctx:"South Korea's exam day shows how much one test can decide: university place, first job and even social standing. Families spend heavily on private tutoring, and governments have repeatedly tried to cool the competition.",ask:"Is one high-stakes exam the fairest way to choose, because everyone sits the same paper, or the least fair, because preparation costs money?",jobs:["Education researcher","School counsellor","Policy adviser"]},
 "cn-astro":{ctx:"Long missions change the body: bones and muscles weaken, fluids shift towards the head and sleep is disturbed. Understanding the brain in space matters for any trip to Mars, which would take many months each way. China runs its own station partly because US law has kept it out of the International Space Station.",ask:"Would space science move faster if rival countries shared one station, or does competition push everyone harder?",jobs:["Neuroscientist","Space medicine doctor","Biomedical engineer"]},
 "cn-cloud":{ctx:"Processing data in orbit saves time, because satellites collect far more than they can send down. The same technology has military uses, which is why other countries watch such plans closely. Thousands of new satellites also add to crowding and debris risk in low orbit.",ask:"Who should set the rules for how many satellites one country or company may launch?",jobs:["Satellite engineer","AI researcher","Space lawyer"]},
 "de-wall":{ctx:"The Wall opened without a shot after months of peaceful protest and a confused press announcement. Germany reunited in 1990, but gaps in wages and political mood between east and west have lasted more than a generation.",ask:"How long does it take for a divided country to truly become one, and what would count as finished?",jobs:["Historian","Journalist","Economist"]},
 "de-martin":{ctx:"Many festivals blend religious stories with older seasonal customs, and communities keep reshaping them. Some German nurseries have used neutral names such as lantern festival so that children of every background feel welcome, which others see as losing a tradition.",ask:"When a tradition changes to include everyone, is something gained or lost?",jobs:["Cultural anthropologist","Primary teacher","Events organiser"]},
 "fr-school":{ctx:"France uses its schools to pass on a shared national memory, and what goes into that memory is decided by the state. Historians point out that official remembrance always chooses what to stress and what to leave out.",ask:"Should a government decide what every school must commemorate?",jobs:["History teacher","Civil servant","Historian"]},
 "fr-armistice":{ctx:"The 1918 armistice stopped the fighting, but the peace treaty that followed is often blamed for helping to cause a second war twenty years later. That is why 11 November is taught as a lesson in how wars end, and not only as a victory.",ask:"What makes a peace last: punishing the loser, or rebuilding with them?",jobs:["Diplomat","Historian","International lawyer"]},
 "g-swift":{ctx:"Contests like this are also how big technology companies find talent early and draw young developers into their own tools. The skills transfer, but the platform you learn on shapes what you build.",ask:"Is a company-run student contest generosity, recruitment or marketing? Does it matter, if students benefit?",jobs:["App developer","UX designer","Product manager"]},
 "g-singles":{ctx:"Shopping festivals work through scarcity and countdowns, which push people to buy before they have thought. Consumer groups have found cases where prices were raised beforehand so the discount looked bigger. Huge sale days also mean packaging waste and delivery emissions.",ask:"If a discount makes you buy something you did not plan to buy, did you save money?",jobs:["Behavioural economist","Supply chain manager","Consumer rights lawyer"]},
 "g-cop31":{ctx:"Climate summits work by agreement of nearly every country, so the result is usually the slowest acceptable step. The hardest arguments are about money: richer countries caused most past emissions, while poorer ones face much of the damage and want help paying for clean energy.",ask:"Should the countries that polluted most in the past pay more, or should today's biggest emitters carry the cost?",jobs:["Climate negotiator","Renewable energy engineer","Environmental economist"]},
 "g-sky":{ctx:"Meteor showers happen when Earth crosses a trail of dust left by a comet. Scientists also track larger objects in the Taurid stream, because knowing what crosses Earth's orbit is the first step in planetary defence.",ask:"How much should the world spend watching for rare asteroid impacts, compared with dangers that happen every year?",jobs:["Astronomer","Planetary scientist","Science communicator"]},
 "g-peace":{ctx:"Peace talks usually stall on the same questions: where borders lie, who guarantees the deal and what happens if it is broken. A ceasefire stops the shooting. A peace agreement has to settle the causes, and that takes much longer.",ask:"Is an imperfect peace that stops the killing better than holding out for a fair one?",jobs:["Diplomat","Conflict researcher","Humanitarian aid worker"]},
 "g-swordfish":{ctx:"Much of what we know about open-ocean animals comes from electronic tags that record depth, light and temperature. The twilight zone they dive into is also being eyed for commercial fishing, before scientists fully understand it.",ask:"Should fishing in the deep ocean wait until the science catches up?",jobs:["Marine biologist","Oceanographer","Fisheries manager"]},
 "g-moon":{ctx:"Water ice matters because launching water from Earth is extremely expensive, and ice can become drinking water, oxygen and rocket fuel. A 1967 treaty says no country can own the Moon, but it is vague about who may use what they dig up.",ask:"If nobody can own the Moon, who decides who mines its ice?",jobs:["Space lawyer","Robotics engineer","Planetary geologist"]},
 "g-science":{ctx:"Most research money is spent by a small number of rich countries and companies, and many journal articles sit behind paywalls. The open science movement argues that publicly funded results should be free for anyone to read.",ask:"Should discoveries paid for by taxpayers ever be locked behind a paywall or a patent?",jobs:["Research scientist","Science policy adviser","Librarian"]},
 "g-kindness":{ctx:"Psychologists test claims about kindness with experiments, and results vary: the lift in mood is real but usually small and short-lived. Researchers also separate kindness that costs the giver something from kindness that is mostly for show.",ask:"Is a kind act worth less if the person doing it posts about it?",jobs:["Psychologist","Social researcher","Community organiser"]}
};
