import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "./supabase.js";
import Login from "./Login.jsx";

const BRAND = { bone:"#F3F1EE", paw:"#181818", grass:"#565F4E", rust:"#9A4536", mud:"#A47E5C", sand:"#BFB3A5", darkGrass:"#333833", drySage:"#8C8A7E" };
const PILLARS = {
  DOG:     { color:"#E06448", sidebarColor:"#F5896C", bg:"#FDEEE8", label:"DOG",        target:3 },
  Culture: { color:"#B07840", sidebarColor:"#D49E64", bg:"#F9E5CE", label:"Culture",    target:2 },
  Bond:    { color:"#8A6A52", sidebarColor:"#BFA088", bg:"#EDE3D7", label:"Bond",       target:2 },
  Edu:     { color:"#B8920A", sidebarColor:"#E5BC2A", bg:"#FBF4D4", label:"Canine Edu", target:2 },
  Brand:   { color:"#5E7A52", sidebarColor:"#92B584", bg:"#DDE8D8", label:"Brand",      target:1 },
  Timely:  { color:"#7B52B8", sidebarColor:"#A684D6", bg:"#E5D9F7", label:"Timely",     target:0 },
  Paid:    { color:"#2D6DAE", sidebarColor:"#5FA3D8", bg:"#D6E6F5", label:"Paid Ad",    target:0 },
  Events:  { color:"#D96A00", sidebarColor:"#FF9836", bg:"#FDE5C8", label:"Events",      target:0 },
  Alerts:  { color:"#B52020", sidebarColor:"#E25A5A", bg:"#FBDAD7", label:"Club Alerts", target:0 },
  Partners:{ color:"#1E7A8A", sidebarColor:"#5BB4C8", bg:"#D4EEF5", label:"Partnerships",target:0 },
};
const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAY_NAMES_SHORT = ["Su","Mo","Tu","We","Th","Fr","Sa"];
const STORAGE_KEY = "dogppl-cal-v2";
const CORE_PILLARS = ["DOG","Culture","Bond","Edu","Brand"];
const CYCLE_TARGET = {DOG:3, Culture:2, Bond:2, Edu:2, Brand:1};

// T3 social concepts, pre-placed Mon-Fri following 3-2-2-2-1 per 10 posts.
// Pattern: DOG,CUL,BOND,EDU,DOG | CUL,DOG,EDU,BOND,BRAND (repeating)
// Recurring formats: Meet [dog] Reel (every ~2 wks), Dog breed origin stories,
//   Rufferee Canine Edu tip (every other Edu slot), Sofia & Margot (different member each time)
const CONTENT_DEFAULTS = {
  "day-2026-4-12": ["edu-t3-3"],
  "day-2026-4-13": ["bond-t3-3"],
  "day-2026-4-14": ["brand-t3-1"],
  "day-2026-4-15": ["dog-t3-1"],
  "day-2026-4-18": ["cul-t3-3"],
  "day-2026-4-19": ["bond-t3-4"],
  "day-2026-4-20": ["edu-t3-1"],
  "day-2026-4-21": ["dog-t3-4"],
  "day-2026-4-22": ["cul-t3-2"],
  "day-2026-4-25": ["dog-t3-10"],
  "day-2026-4-26": ["edu-t3-4"],
  "day-2026-4-27": ["bond-t3-2"],
  "day-2026-4-28": ["brand-t3-2"],
  "day-2026-4-29": ["dog-t3-1"],
  "day-2026-5-1": ["cul-t3-5"],
  "day-2026-5-2": ["bond-t3-5"],
  "day-2026-5-3": ["edu-t3-1"],
  "day-2026-5-4": ["dog-t3-5"],
  "day-2026-5-5": ["cul-t3-2"],
  "day-2026-5-8": ["dog-t3-12"],
  "day-2026-5-9": ["edu-t3-2"],
  "day-2026-5-10": ["bond-t3-4"],
  "day-2026-5-11": ["brand-t3-3"],
  "day-2026-5-12": ["dog-t3-1"],
  "day-2026-5-15": ["cul-t3-1"],
  "day-2026-5-16": ["bond-t3-6"],
  "day-2026-5-17": ["edu-t3-1"],
  "day-2026-5-18": ["dog-t3-8"],
  "day-2026-5-19": ["cul-t3-2"],
  "day-2026-5-22": ["dog-t3-11"],
  "day-2026-5-23": ["edu-t3-5"],
  "day-2026-5-24": ["bond-t3-7"],
  "day-2026-5-25": ["brand-t3-4"],
  "day-2026-5-26": ["dog-t3-1"],
  "day-2026-5-29": ["cul-t3-3"],
  "day-2026-5-30": ["bond-t3-4"],
  "day-2026-6-1": ["edu-t3-1"],
  "day-2026-6-2": ["dog-t3-9"],
  "day-2026-6-3": ["cul-t3-2"],
  "day-2026-6-6": ["dog-t3-6"],
  "day-2026-6-7": ["edu-t3-6"],
  "day-2026-6-8": ["bond-t3-1"],
  "day-2026-6-9": ["brand-t3-5"],
  "day-2026-6-10": ["dog-t3-1"],
  "day-2026-6-13": ["cul-t3-5"],
  "day-2026-6-14": ["bond-t3-3"],
  "day-2026-6-15": ["edu-t3-1"],
  "day-2026-6-16": ["dog-t3-7"],
  "day-2026-6-17": ["cul-t3-2"],
  "day-2026-6-20": ["dog-t3-13"],
  "day-2026-6-21": ["edu-t3-7"],
  "day-2026-6-22": ["bond-t3-4"],
  "day-2026-6-23": ["brand-t3-6"],
  "day-2026-6-24": ["dog-t3-1"],
  "day-2026-6-27": ["cul-t3-1"],
  "day-2026-6-28": ["bond-t3-2"],
  "day-2026-6-29": ["edu-t3-1"],
  "day-2026-6-30": ["dog-t3-3"],
  "day-2026-6-31": ["cul-t3-2"],
  "day-2026-7-3": ["dog-t3-2"],
  "day-2026-7-4": ["edu-t3-8"],
  "day-2026-7-5": ["bond-t3-5"],
  "day-2026-7-6": ["brand-t3-7"],
  "day-2026-7-7": ["dog-t3-1"],
  "day-2026-7-10": ["cul-t3-3"],
  "day-2026-7-11": ["bond-t3-4"],
  "day-2026-7-12": ["edu-t3-1"],
  "day-2026-7-13": ["dog-t3-4"],
  "day-2026-7-14": ["cul-t3-2"],
  "day-2026-7-17": ["dog-t3-10"],
  "day-2026-7-18": ["edu-t3-9"],
  "day-2026-7-19": ["bond-t3-6"],
  "day-2026-7-20": ["brand-t3-8"],
  "day-2026-7-21": ["dog-t3-1"],
  "day-2026-7-24": ["cul-t3-1"],
  "day-2026-7-25": ["bond-t3-1"],
  "day-2026-7-26": ["edu-t3-1"],
  "day-2026-7-27": ["dog-t3-3"],
  "day-2026-7-28": ["cul-t3-2"],
  "day-2026-7-31": ["dog-t3-2"],
  "day-2026-8-1": ["edu-t3-10"],
  "day-2026-8-2": ["bond-t3-3"],
  "day-2026-8-3": ["brand-t3-9"],
  "day-2026-8-4": ["dog-t3-1"],
  "day-2026-8-7": ["cul-t3-3"],
  "day-2026-8-8": ["bond-t3-4"],
  "day-2026-8-9": ["edu-t3-1"],
  "day-2026-8-10": ["dog-t3-4"],
  "day-2026-8-11": ["cul-t3-2"],
  "day-2026-8-14": ["dog-t3-10"],
  "day-2026-8-15": ["edu-t3-3"],
  "day-2026-8-16": ["bond-t3-2"],
  "day-2026-8-17": ["brand-t3-10"],
  "day-2026-8-18": ["dog-t3-1"],
  "day-2026-8-21": ["cul-t3-5"],
  "day-2026-8-22": ["bond-t3-5"],
  "day-2026-8-23": ["edu-t3-1"],
  "day-2026-8-24": ["dog-t3-5"],
  "day-2026-8-25": ["cul-t3-2"],
  "day-2026-8-28": ["dog-t3-12"],
  "day-2026-8-29": ["edu-t3-4"],
  "day-2026-8-30": ["bond-t3-4"],
  "day-2026-9-1": ["brand-t3-11"],
  "day-2026-9-2": ["dog-t3-1"],
  "day-2026-9-5": ["cul-t3-1"],
  "day-2026-9-6": ["bond-t3-6"],
  "day-2026-9-7": ["edu-t3-1"],
  "day-2026-9-8": ["dog-t3-8"],
  "day-2026-9-9": ["cul-t3-2"],
  "day-2026-9-12": ["dog-t3-11"],
  "day-2026-9-13": ["edu-t3-3"],
  "day-2026-9-14": ["bond-t3-7"],
  "day-2026-9-15": ["brand-t3-12"],
  "day-2026-9-16": ["dog-t3-1"],
  "day-2026-9-19": ["cul-t3-3"],
  "day-2026-9-20": ["bond-t3-4"],
  "day-2026-9-21": ["edu-t3-1"],
  "day-2026-9-22": ["dog-t3-9"],
  "day-2026-9-23": ["cul-t3-2"],
  "day-2026-9-26": ["dog-t3-6"],
  "day-2026-9-27": ["edu-t3-4"],
  "day-2026-9-28": ["bond-t3-1"],
  "day-2026-9-29": ["brand-t3-13"],
  "day-2026-9-30": ["dog-t3-1"],
  "day-2026-10-2": ["cul-t3-5"],
  "day-2026-10-3": ["bond-t3-3"],
  "day-2026-10-4": ["edu-t3-1"],
  "day-2026-10-5": ["dog-t3-7"],
  "day-2026-10-6": ["cul-t3-2"],
  "day-2026-10-9": ["dog-t3-13"],
  "day-2026-10-10": ["edu-t3-2"],
  "day-2026-10-11": ["bond-t3-4"],
  "day-2026-10-12": ["brand-t3-14"],
  "day-2026-10-13": ["dog-t3-1"],
  "day-2026-10-16": ["cul-t3-1"],
  "day-2026-10-17": ["bond-t3-2"],
  "day-2026-10-18": ["edu-t3-1"],
  "day-2026-10-19": ["dog-t3-3"],
  "day-2026-10-20": ["cul-t3-2"],
  "day-2026-10-23": ["dog-t3-2"],
  "day-2026-10-24": ["edu-t3-5"],
  "day-2026-10-25": ["bond-t3-5"],
  "day-2026-10-26": ["brand-t3-1"],
  "day-2026-10-27": ["dog-t3-1"],
  "day-2026-10-30": ["cul-t3-3"],
  "day-2026-11-1": ["bond-t3-4"],
  "day-2026-11-2": ["edu-t3-1"],
  "day-2026-11-3": ["dog-t3-4"],
  "day-2026-11-4": ["cul-t3-2"],
  "day-2026-11-7": ["dog-t3-10"],
  "day-2026-11-8": ["edu-t3-6"],
  "day-2026-11-9": ["bond-t3-6"],
  "day-2026-11-10": ["brand-t3-2"],
  "day-2026-11-11": ["dog-t3-1"],
  "day-2026-11-14": ["cul-t3-1"],
  "day-2026-11-15": ["bond-t3-1"],
  "day-2026-11-16": ["edu-t3-1"],
  "day-2026-11-17": ["dog-t3-3"],
  "day-2026-11-18": ["cul-t3-2"],
  "day-2026-11-21": ["dog-t3-2"],
  "day-2026-11-22": ["edu-t3-7"],
  "day-2026-11-23": ["bond-t3-3"],
  "day-2026-11-24": ["brand-t3-3"],
  "day-2026-11-25": ["dog-t3-1"],
  "day-2026-11-28": ["cul-t3-3"],
  "day-2026-11-29": ["bond-t3-4"],
  "day-2026-11-30": ["edu-t3-1"],
  "day-2026-11-31": ["dog-t3-4"],
};

const TIMELY_DEFAULTS = {
  "day-2026-5-11": ["timely-wc"],
  "day-2026-5-18": ["timely-wkly"],
  "day-2026-5-25": ["timely-wkly"],
  "day-2026-5-29": ["timely-wb"],
  "day-2026-6-1":  ["timely-post"],
  "day-2026-6-2":  ["timely-wkly"],
  "day-2026-6-4":  ["timely-4j"],
  "day-2026-6-9":  ["timely-wkly"],
  "day-2026-6-16": ["timely-wkly"],
  "day-2026-6-19": ["timely-wcf"],
  "day-2026-7-1":  ["timely-ndd"],
  "day-2026-8-11": ["timely-nfl"],
  "day-2026-8-22": ["timely-fof"],
  "day-2026-9-10": ["timely-wmhd"],
  "day-2026-9-15": ["timely-mlb"],
  "day-2026-9-31": ["timely-hw"],
  "day-2026-10-11":["timely-vd"],
  "day-2026-10-26":["timely-tg"],
  "day-2026-11-28":["timely-yr"],
  "day-2026-11-31":["timely-nye"],
};

const CONCEPTS = [
  {id:"dog-t3-1",  title:"Meet [dog] Reel",                       pillar:"DOG",     tier:"T3", note:"Weekly character portrait. 15 sec. One dog, one line."},
  {id:"dog-t3-2",  title:"The head tilt",                          pillar:"DOG",     tier:"T3", note:"Close-up Reel. Dog hearing something confusing. No caption needed."},
  {id:"dog-t3-3",  title:"The zoomies",                            pillar:"DOG",     tier:"T3", note:"Club footage, dog sprinting at nothing. Caption: \"No notes.\""},
  {id:"dog-t3-4",  title:"Before/after the park",                  pillar:"DOG",     tier:"T3", note:"Carousel: chaotic dog in → cooked dog out."},
  {id:"dog-t3-5",  title:"Dog with one job",                       pillar:"DOG",     tier:"T3", note:"Dog sitting by the gate waiting for their human. Every day."},
  {id:"dog-t3-6",  title:"T-R-E-A-T-S / P-A-R-K / W-A-L-K",      pillar:"DOG",     tier:"T3", note:"Dog owners spelling trigger words. Universal, instant share. Also Paid T3."},
  {id:"dog-t3-7",  title:"Stop Scrolling, More Petting",           pillar:"DOG",     tier:"T3", note:"\"Put down your phone. Pet your dog.\" Also Paid T3."},
  {id:"dog-t3-8",  title:"You can drool with us",                  pillar:"DOG",     tier:"T3", note:"Photo of big, droolie, happy dog at the club."},
  {id:"dog-t3-9",  title:"Backseat window dog → you belong here",  pillar:"DOG",     tier:"T3", note:"Works as static or short Reel setup."},
  {id:"dog-t3-10", title:"Another satisfied member",               pillar:"DOG",     tier:"T3", note:"Dog pic, ridiculously happy. Caption: \"Another satisfied member.\""},
  {id:"dog-t3-11", title:"Hang with us — leash wall",              pillar:"DOG",     tier:"T3", note:"Image or short video of the leash wall."},
  {id:"dog-t3-12", title:"Interrupting your feed with joy",        pillar:"DOG",     tier:"T3", note:"Cutest dog content drop. \"Compliments of DOG PPL.\""},
  {id:"dog-t3-13", title:"Acceptance Memes",                       pillar:"DOG",     tier:"T3", note:"Famous movie reactions → passing the temperament test."},
  {id:"dog-t2-1",  title:"Nicknames",                              pillar:"DOG",     tier:"T2", note:"Members list theirs, show reactions. Recurring series."},
  {id:"dog-t2-2",  title:"Your person will be right back",         pillar:"DOG",     tier:"T2", note:"Dogs losing it when owners go to the restroom."},
  {id:"dog-t2-3",  title:"Security footage repurposed",            pillar:"DOG",     tier:"T2", note:"Bloopers from security cameras. Zero production cost."},
  {id:"dog-t2-4",  title:"Pulling up — too excited to leash",      pillar:"DOG",     tier:"T2", note:"Dogs dragging owners through gates. Also Paid T2."},
  {id:"dog-t2-5",  title:"Dog watching > people watching",         pillar:"DOG",     tier:"T2", note:"Dogs tracking other dogs like a Wimbledon audience."},
  {id:"dog-t2-6",  title:"Member Testimonials — happy/exhausted",  pillar:"DOG",     tier:"T2", note:"Ridiculously happy or cooked dogs after a session."},
  {id:"cul-t3-1",  title:"Picasso & Lump",                         pillar:"Culture", tier:"T3", note:"\"He painted him into his work 49 times.\""},
  {id:"cul-t3-2",  title:"Dog breed origin stories",               pillar:"Culture", tier:"T3", note:"Different breed each time. \"The Lab was bred to retrieve fishing nets, not your ball.\""},
  {id:"cul-t3-3",  title:"Famous dog firsts",                      pillar:"Culture", tier:"T3", note:"First dog in space, first dog to throw a first pitch. History is full of these."},
  {id:"cul-t3-4",  title:"The Dodger play",                        pillar:"Culture", tier:"T3", note:"Big cultural moment with a dog angle. React within 24h."},
  {id:"cul-t3-5",  title:"These are just a few of my fav things",  pillar:"Culture", tier:"T3", note:"Sound of Music parody — dogs and club amenities."},
  {id:"cul-t2-1",  title:"Dog Person Since [year]",                pillar:"Culture", tier:"T2", note:"\"DOG PERSON SINCE '96 / MJ + OZZIE.\" Recurring series."},
  {id:"cul-t2-2",  title:"Treat the Drivers + Dear Postperson",    pillar:"Culture", tier:"T2", note:"Jul 1: Gift a membership to a delivery driver. Dog apology letters to postal workers."},
  {id:"cul-t2-3",  title:"Everyday is bring your dog to work day", pillar:"Culture", tier:"T2", note:"At DOG PPL, every day is that day."},
  {id:"cul-t2-4",  title:"OUR PPL mini episodes",                  pillar:"Culture", tier:"T2", note:"Member stories in short-form video."},
  {id:"bond-t3-1", title:"The rearranged life",                    pillar:"Bond",    tier:"T3", note:"\"I turned down the promotion. I moved apartments. She has no idea.\""},
  {id:"bond-t3-2", title:"The guilt of leaving / Cure to FOMO",    pillar:"Bond",    tier:"T3", note:"Dog watching owner walk away. Now you can both go somewhere."},
  {id:"bond-t3-3", title:"They always know",                       pillar:"Bond",    tier:"T3", note:"4-slide carousel: moments they read you before you say a word."},
  {id:"bond-t3-4", title:"Sofia & Margot format",                  pillar:"Bond",    tier:"T3", note:"Member quote. Two sentences of context. Different member each time."},
  {id:"bond-t3-5", title:"The way they wait",                      pillar:"Bond",    tier:"T3", note:"10-sec Reel. Owner approaches. Dog loses it before they're even close."},
  {id:"bond-t3-6", title:"Life moves fast, slow it down for them", pillar:"Bond",    tier:"T3", note:"Atmospheric Bond post. Golden hour. A moment of stillness."},
  {id:"bond-t3-7", title:"Their joy is our joy",                   pillar:"Bond",    tier:"T3", note:"Simple caption over a genuine dog happiness moment."},
  {id:"bond-t2-1", title:"Studio Testimonials / Day in the Life",  pillar:"Bond",    tier:"T2", note:"Interview-style testimonials + follow members through daily life."},
  {id:"bond-t2-2", title:"Split POV",                              pillar:"Bond",    tier:"T2", note:"Human POV on top, dog POV on bottom. Same journey to DOG PPL."},
  {id:"bond-t2-3", title:"Sorry I can't come to the phone",       pillar:"Bond",    tier:"T2", note:"Audio over someone deep in a moment with their dog at the club."},
  {id:"edu-t3-1",  title:"Rufferee Canine Edu tip",                pillar:"Edu",     tier:"T3", note:"Recurring format — different tip each time. Dogs don't misbehave, they communicate."},
  {id:"edu-t3-2",  title:"Why not take toys to the park",          pillar:"Edu",     tier:"T3", note:"Counter-intuitive, ownable, safety-relevant."},
  {id:"edu-t3-3",  title:"The eye contact oxytocin fact",          pillar:"Edu",     tier:"T3", note:"Same hormone as holding a baby."},
  {id:"edu-t3-4",  title:"Dogs choose humans who look like them",  pillar:"Edu",     tier:"T3", note:"Study-backed, funny, true."},
  {id:"edu-t3-5",  title:"How to cool your dog down",              pillar:"Edu",     tier:"T3", note:"Corrects a common mistake. Not water on the back. Run in summer."},
  {id:"edu-t3-6",  title:"Stages of decompression in a new dog",   pillar:"Edu",     tier:"T3", note:"Three months is real. New owners need this."},
  {id:"edu-t3-7",  title:"Touch Turf. Doctor's orders.",          pillar:"Edu",     tier:"T3", note:"Off-leash time and grass under paws is good for dogs."},
  {id:"edu-t3-8",  title:"Said no dog person ever. (off leash)",   pillar:"Edu",     tier:"T3", note:"Humor + safety. Sets up DOG PPL solution."},
  {id:"edu-t3-9",  title:"Since when is tying up 'dog-friendly'",pillar:"Edu",     tier:"T3", note:"Rhetorical question. Calls out the status quo."},
  {id:"edu-t3-10", title:"Tired of taking the L in dog parks",     pillar:"Edu",     tier:"T3", note:"Problem framing. Sets up DOG PPL as the answer."},
  {id:"edu-t2-1",  title:"Rufferee Canine Edu series",             pillar:"Edu",     tier:"T2", note:"Rufferee-led quick tips. Recurring."},
  {id:"edu-t2-2",  title:"Rules of the Land / TSA education",      pillar:"Edu",     tier:"T2", note:"Club rules through humor. Progressive or TSA parody."},
  {id:"edu-t2-3",  title:"PSA series",                             pillar:"Edu",     tier:"T2", note:"Public Service Announcement by DOG PPL."},
  {id:"brand-t3-1",title:"The blanket is always out",              pillar:"Brand",   tier:"T3", note:"Detail shot. \"See you when you get here.\""},
  {id:"brand-t3-2",title:"The latte + the dog",                    pillar:"Brand",   tier:"T3", note:"Coffee cup on a table, dog in soft focus behind it."},
  {id:"brand-t3-3",title:"Friday nights like these",               pillar:"Brand",   tier:"T3", note:"Wide club shot, golden hour. Caption: \">>>\"."},
  {id:"brand-t3-4",title:"His couch. I just pay for it.",          pillar:"Brand",   tier:"T3", note:"Dog occupying prime sofa real estate."},
  {id:"brand-t3-5",title:"See you at the club",                    pillar:"Brand",   tier:"T3", note:"Clean sign-off. Brand post or story closer."},
  {id:"brand-t3-6",title:"We speak dog",                           pillar:"Brand",   tier:"T3", note:"Two words. Atmospheric Brand post."},
  {id:"brand-t3-7",title:"Dog Club > Night Club",                  pillar:"Brand",   tier:"T3", note:"Club at night, warm light."},
  {id:"brand-t3-8",title:"Must be nice / It is",                   pillar:"Brand",   tier:"T3", note:"Texting overlay on club video. Also Paid T3."},
  {id:"brand-t3-9",title:"You've arrived",                        pillar:"Brand",   tier:"T3", note:"Atmospheric arrival moment."},
  {id:"brand-t3-10",title:"A place for us",                        pillar:"Brand",   tier:"T3", note:"Inclusive, simple Brand statement."},
  {id:"brand-t3-11",title:"They deserve the world, we built it",   pillar:"Brand",   tier:"T3", note:"Brand manifesto line as a post."},
  {id:"brand-t3-12",title:"If we are being honest, you belong here",pillar:"Brand",  tier:"T3", note:"Warm, direct membership invitation."},
  {id:"brand-t3-13",title:"Tell me you're a dog person",          pillar:"Brand",   tier:"T3", note:"Format post. Relatable, shareable."},
  {id:"brand-t3-14",title:"I did sign up for this",                pillar:"Brand",   tier:"T3", note:"Flip of \"I didn't sign up for this.\""},
  {id:"brand-t2-1",title:"Opening duties / ASMR / Pains we take",  pillar:"Brand",   tier:"T2", note:"Aviation Gin parody: staff obsessed with quality details."},
  {id:"brand-t2-2",title:"They don't all wear capes — Rufferees",  pillar:"Brand",  tier:"T2", note:"Scott Pilgrim-style graphics. Rufferees as superheroes."},
  {id:"brand-t2-3",title:"WFP / Work From Park",                   pillar:"Brand",   tier:"T2", note:"Members working from the club with their dog."},
  {id:"brand-t2-4",title:"Bad reviews / 1-star for 5-star safety", pillar:"Brand",   tier:"T2", note:"Direct-to-camera talking head."},
  {id:"brand-t2-5",title:"They act like they own the place",       pillar:"Brand",   tier:"T2", note:"Staff confessional reveals it's the dogs."},
  {id:"brand-t2-6",title:"Raise your glass / Mind the dogs",       pillar:"Brand",   tier:"T2", note:"Drinks raised to protect from dogs — misread as a toast."},
  {id:"brand-t1-1",title:"Leash Banter",                           pillar:"Brand",   tier:"T1", note:"Leashes on wall talking while dogs play."},
  {id:"brand-t1-2",title:"Manifesto video",                        pillar:"Brand",   tier:"T1", note:"UGC/found footage. Zach Bryan energy."},
  {id:"bond-t1-1", title:"The Hand That Feeds",                    pillar:"Bond",    tier:"T1", note:"Tight shots of hands in every dog-related moment."},
  {id:"timely-mg",  title:"Met Gala",                               pillar:"Timely",  tier:"T3", note:"May 4 — dogs of fashion history. Reactive."},
  {id:"timely-md",  title:"Mother's Day",                          pillar:"Timely",  tier:"T3", note:"May 10 — the members who are dog moms first."},
  {id:"timely-wc",  title:"FIFA World Cup kicks off",               pillar:"Timely",  tier:"T3", note:"Jun 11 — dog of each host nation (US/Canada/Mexico)."},
  {id:"timely-wkly",title:"World Cup weekly post",                  pillar:"Timely",  tier:"T3", note:"One footballer+dog or dog-of-nation post. Runs Jun–Jul."},
  {id:"timely-wb",  title:"Wimbledon",                              pillar:"Timely",  tier:"T3", note:"Jun 29 – Jul 12 — famous players with dogs."},
  {id:"timely-post",title:"Treat the Drivers + Dear Postperson",    pillar:"Timely",  tier:"T2", note:"Jul 1 — National Postal Worker Day activation."},
  {id:"timely-4j",  title:"4th of July — fireworks anxiety",        pillar:"Timely",  tier:"T3", note:"Jul 4 — fireworks safety tips. Pre-plan every year."},
  {id:"timely-wcf", title:"World Cup Final",                        pillar:"Timely",  tier:"T3", note:"Jul 19 — biggest content day of the summer. React within the hour."},
  {id:"timely-ndd", title:"National Dog Day",                       pillar:"Timely",  tier:"T2", note:"Aug 1 — your Super Bowl. Full activation across all channels."},
  {id:"timely-nfl", title:"NFL Week 1 — season opener",             pillar:"Timely",  tier:"T3", note:"Sep 11 — \"Sundays just got better. For you and your dog.\""},
  {id:"timely-fof", title:"First day of fall",                      pillar:"Timely",  tier:"T3", note:"Sep 22 — fall vibes at the club. Golden hour gets better."},
  {id:"timely-wmhd",title:"World Mental Health Day",                pillar:"Timely",  tier:"T2", note:"Oct 10 — dogs and mental health. The oxytocin science."},
  {id:"timely-mlb", title:"MLB playoffs — Dodgers reactive",        pillar:"Timely",  tier:"T3", note:"Oct TBD — if Dodgers are in it, run it. React within 24h."},
  {id:"timely-hw",  title:"Halloween — dogs in costumes",           pillar:"Timely",  tier:"T3", note:"Oct 31 — shoot at the club. UGC from members."},
  {id:"timely-vd",  title:"Veterans Day",                           pillar:"Timely",  tier:"T2", note:"Nov 11 — military dogs. Working dogs. Dogs who served."},
  {id:"timely-tg",  title:"Thanksgiving",                           pillar:"Timely",  tier:"T3", note:"Nov 26 — the wait. The eyes. The leftovers debate."},
  {id:"timely-nye", title:"NYE — fireworks anxiety",                pillar:"Timely",  tier:"T3", note:"Dec 31 — same as 4th of July. Shoot once, use every year."},
  {id:"timely-yr",  title:"Year-in-review",                         pillar:"Timely",  tier:"T2", note:"Late Dec — best member + dog moments of 2026."},
  {id:"paid-1",    title:"Backseat window dog (paid)",              pillar:"Paid",    tier:"T3", note:"Paid T3 — strong hook."},
  {id:"paid-2",    title:"The yard your dog deserves (paid)",       pillar:"Paid",    tier:"T3", note:"Geo-targeted — apartment owners."},
  {id:"paid-3",    title:"Tired of taking the L (paid)",            pillar:"Paid",    tier:"T3", note:"Paid T3 — sets up DOG PPL as the answer."},
  {id:"paid-4",    title:"Arrival reaction videos (paid)",          pillar:"Paid",    tier:"T3", note:"Paid T3 — jaw-drop, don't show the product."},
  {id:"paid-5",    title:"Problem/Solution split screen (paid)",    pillar:"Paid",    tier:"T2", note:"Paid T2 — same dog home vs. DOG PPL."},
  {id:"event-1",  title:"Event promo (3-day out)",        pillar:"Events",   tier:"T3", note:"Send 3 days before any club event. Template: date, what it is, link to RSVP."},
  {id:"event-2",  title:"Event day reminder",              pillar:"Events",   tier:"T3", note:"Day-of reminder. Short, urgent. Story format works well."},
  {id:"event-3",  title:"Event recap",                     pillar:"Events",   tier:"T3", note:"Post-event. Best photo + one line. Tags any partners."},
  {id:"alert-1",  title:"Holiday closure notice",          pillar:"Alerts",   tier:"T3", note:"Club closed for holiday. Post 48h out + day of. Story + feed post."},
  {id:"alert-2",  title:"Weather/safety closure",          pillar:"Alerts",   tier:"T3", note:"Unplanned closure. Post immediately. Story first, feed post to follow."},
  {id:"alert-3",  title:"Modified hours notice",           pillar:"Alerts",   tier:"T3", note:"Reduced or extended hours. Story format. Pin if multi-day."},
  {id:"partner-1",title:"Partner feature post",            pillar:"Partners", tier:"T3", note:"Per partnership agreement. Tag partner. Coordinate copy/assets with them."},
  {id:"partner-2",title:"Partner story",                   pillar:"Partners", tier:"T3", note:"Story-format partner post. Swipe up if applicable."},
  {id:"partner-3",title:"Co-branded content",              pillar:"Partners", tier:"T2", note:"Heavier lift. Requires asset prep. Coordinate 2 weeks out."},
  {id:"ev-01-promo",  title:"Mother's Day Sip & Stem — promo",            pillar:"Events", tier:"T3", note:"3-day-out promo for Mother's Day Sip & Stem with Just Food For Dogs."},
  {id:"ev-01-day",    title:"Mother's Day Sip & Stem — day-of",           pillar:"Events", tier:"T3", note:"Day-of for Mother's Day Sip & Stem with Just Food For Dogs."},
  {id:"ev-02-promo",  title:"Canvas & Cocktails — promo",                 pillar:"Events", tier:"T3", note:"3-day-out promo for Canvas & Cocktails with Ali Futrell Art (Juneshine Bev sponsor)."},
  {id:"ev-02-day",    title:"Canvas & Cocktails — day-of",                pillar:"Events", tier:"T3", note:"Day-of for Canvas & Cocktails with Ali Futrell Art (Juneshine Bev sponsor)."},
  {id:"ev-03-promo",  title:"Green Dog Dental Vaccine Pop Up — promo",    pillar:"Events", tier:"T3", note:"3-day-out promo for Vaccine Pop Up by Green Dog Dental."},
  {id:"ev-03-day",    title:"Green Dog Dental Vaccine Pop Up — day-of",   pillar:"Events", tier:"T3", note:"Day-of for Vaccine Pop Up by Green Dog Dental."},
  {id:"ev-04-promo",  title:"Small Dogs Big Party — promo",               pillar:"Events", tier:"T3", note:"3-day-out promo for Small Dogs Big Party presented by Small Matters."},
  {id:"ev-04-day",    title:"Small Dogs Big Party — day-of",              pillar:"Events", tier:"T3", note:"Day-of for Small Dogs Big Party presented by Small Matters."},
  {id:"ev-05-promo",  title:"Trivia Night — promo",                       pillar:"Events", tier:"T3", note:"3-day-out promo for Trivia Night."},
  {id:"ev-05-day",    title:"Trivia Night — day-of",                      pillar:"Events", tier:"T3", note:"Day-of for Trivia Night."},
  {id:"ev-06-promo",  title:"Memorial Day Drink Specials — promo",        pillar:"Events", tier:"T3", note:"3-day-out promo for Memorial Day Weekend Drink Specials."},
  {id:"ev-06-day",    title:"Memorial Day Drink Specials — day-of",       pillar:"Events", tier:"T3", note:"Day-of for Memorial Day Weekend Drink Specials."},
  {id:"ev-07-promo",  title:"CFC x Nordic Naturals — promo",              pillar:"Events", tier:"T3", note:"3-day-out promo for CFC x Nordic Naturals."},
  {id:"ev-07-before", title:"CFC x Nordic Naturals — day-before reminder",pillar:"Events", tier:"T3", note:"Day-before reminder for CFC x Nordic Naturals."},
  {id:"ev-07-day",    title:"CFC x Nordic Naturals — day-of",             pillar:"Events", tier:"T3", note:"Day-of for CFC x Nordic Naturals."},
  {id:"ev-08-promo",  title:"Sounds and Hounds Pride Pregame — promo",    pillar:"Events", tier:"T3", note:"3-day-out promo for Sounds and Hounds Pride Pregame."},
  {id:"ev-08-morning",title:"Sounds and Hounds Pride Pregame — morning story",pillar:"Events", tier:"T3", note:"Morning-of story for Sounds and Hounds Pride Pregame."},
  {id:"ev-08-day",    title:"Sounds and Hounds Pride Pregame — day-of",   pillar:"Events", tier:"T3", note:"Day-of for Sounds and Hounds Pride Pregame."},
  {id:"ev-09-promo",  title:"Dog Bowl Pottery Class — promo",             pillar:"Events", tier:"T3", note:"3-day-out promo for Creative Workshop Dog Bowl Pottery Class with Cruz Creations."},
  {id:"ev-09-day",    title:"Dog Bowl Pottery Class — day-of",            pillar:"Events", tier:"T3", note:"Day-of for Creative Workshop Dog Bowl Pottery Class with Cruz Creations."},
  {id:"ev-10-promo",  title:"Senior Dog Day — promo",                     pillar:"Events", tier:"T3", note:"3-day-out promo for Senior Dog Day Presented by Native Pet."},
  {id:"ev-10-before", title:"Senior Dog Day — day-before reminder",       pillar:"Events", tier:"T3", note:"Day-before reminder for Senior Dog Day Presented by Native Pet."},
  {id:"ev-10-day",    title:"Senior Dog Day — day-of",                    pillar:"Events", tier:"T3", note:"Day-of for Senior Dog Day Presented by Native Pet."},
  {id:"ev-11-promo",  title:"Creatures of Habit Trivia — promo",          pillar:"Events", tier:"T3", note:"3-day-out promo for Creatures of Habit Trivia Night."},
  {id:"ev-11-day",    title:"Creatures of Habit Trivia — day-of",         pillar:"Events", tier:"T3", note:"Day-of for Creatures of Habit Trivia Night."},
  {id:"ev-12-day",    title:"Father's Day placeholder",                   pillar:"Events", tier:"T3", note:"Day-of Father's Day placeholder."},
  {id:"ev-13-promo",  title:"Twitch Pet Awards Live Stream — promo",      pillar:"Events", tier:"T3", note:"3-day-out promo for Twitch Pet Awards Live Streaming Event."},
  {id:"ev-13-day",    title:"Twitch Pet Awards Live Stream — day-of",     pillar:"Events", tier:"T3", note:"Day-of for Twitch Pet Awards Live Streaming Event."},
  {id:"ev-14-promo",  title:"COH Canine Fitness Club — promo",            pillar:"Events", tier:"T3", note:"3-day-out promo for Creatures of Habit Canine Fitness Club."},
  {id:"ev-14-day",    title:"COH Canine Fitness Club — day-of",           pillar:"Events", tier:"T3", note:"Day-of for Creatures of Habit Canine Fitness Club."},
  {id:"ev-15-promo",  title:"COH Vaccine Pop Up — promo",                 pillar:"Events", tier:"T3", note:"3-day-out promo for Creatures of Habit Vaccine Pop Up."},
  {id:"ev-15-day",    title:"COH Vaccine Pop Up — day-of",                pillar:"Events", tier:"T3", note:"Day-of for Creatures of Habit Vaccine Pop Up."},
  {id:"camp-pack",              title:"We Got Your Pack",                                   pillar:"Brand",   tier:"T1", note:"A promise of belonging. The pack is here, and we have you.", preferred_format:"Campaign"},
  {id:"camp-worth-it",          title:"Worth It",                                           pillar:"Bond",    tier:"T1", note:"Every reason it's hard. Every reason it's worth it.",        preferred_format:"Campaign"},
  {id:"camp-no-leashes",        title:"Where We're Going We Don't Need Leashes",            pillar:"Culture", tier:"T1", note:"A declaration. A destination. A different kind of freedom.", preferred_format:"Campaign"},
  {id:"camp-tell-a-dog-person", title:"Tell a Dog Person",                                  pillar:"Brand",   tier:"T1", note:"Word of mouth, made physical. A card you hand to the right person.", preferred_format:"Campaign"},
];

const PILLAR_PREFERRED_FORMAT = {
  DOG: "Reel",
  Bond: "Reel",
  Culture: "Carousel",
  Edu: "Carousel",
  Brand: "Carousel",
};
for (const c of CONCEPTS) {
  if (c.preferred_format === undefined) {
    c.preferred_format = PILLAR_PREFERRED_FORMAT[c.pillar] ?? null;
  }
}

const EVENTS_DEFAULTS = {
  "day-2026-4-7":  ["ev-01-promo"],
  "day-2026-4-10": ["ev-01-day","ev-02-promo"],
  "day-2026-4-13": ["ev-02-day"],
  "day-2026-4-14": ["ev-03-promo"],
  "day-2026-4-15": ["ev-04-promo"],
  "day-2026-4-17": ["ev-03-day"],
  "day-2026-4-18": ["ev-04-day","ev-05-promo"],
  "day-2026-4-19": ["ev-06-promo"],
  "day-2026-4-20": ["ev-07-promo"],
  "day-2026-4-21": ["ev-05-day"],
  "day-2026-4-22": ["ev-06-day","ev-07-before"],
  "day-2026-4-23": ["ev-07-day"],
  "day-2026-5-2":  ["ev-08-promo"],
  "day-2026-5-3":  ["ev-09-promo"],
  "day-2026-5-5":  ["ev-08-morning","ev-08-day"],
  "day-2026-5-6":  ["ev-09-day"],
  "day-2026-5-10": ["ev-10-promo"],
  "day-2026-5-12": ["ev-10-before"],
  "day-2026-5-13": ["ev-10-day"],
  "day-2026-5-15": ["ev-11-promo"],
  "day-2026-5-18": ["ev-11-day"],
  "day-2026-5-21": ["ev-12-day"],
  "day-2026-5-23": ["ev-13-promo"],
  "day-2026-5-24": ["ev-14-promo"],
  "day-2026-5-25": ["ev-15-promo"],
  "day-2026-5-26": ["ev-13-day"],
  "day-2026-5-27": ["ev-14-day"],
  "day-2026-5-28": ["ev-15-day"],
};

function generateDays() {
  const days = [];
  const start = new Date(2026, 4, 1);
  const end = new Date(2026, 11, 31);
  const cur = new Date(start);
  while (cur <= end) {
    days.push({ id:`day-${cur.getFullYear()}-${cur.getMonth()}-${cur.getDate()}`, date:new Date(cur), month:cur.getMonth() });
    cur.setDate(cur.getDate() + 1);
  }
  return days;
}
const ALL_DAYS = generateDays();

function getWeeksInMonth(month) {
  const days = ALL_DAYS.filter(d => d.month === month);
  const weeks = [];
  const firstDay = days[0].date.getDay();
  let week = Array(firstDay).fill(null);
  for (const d of days) {
    week.push(d);
    if (d.date.getDay() === 6) { weeks.push(week); week = []; }
  }
  if (week.length > 0) { while(week.length < 7) week.push(null); weeks.push(week); }
  return weeks;
}

async function loadFromSupabase() {
  if (!supabase) {
    try { const v = localStorage.getItem(STORAGE_KEY); return v ? JSON.parse(v) : null; } catch(e){ return null; }
  }
  const { data, error } = await supabase
    .from('calendar_state')
    .select('placements')
    .eq('id', 1)
    .single();
  if (error || !data) return null;
  return data.placements;
}

async function saveToSupabase(placements) {
  if (!supabase) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(placements)); } catch(e){}
    return;
  }
  await supabase
    .from('calendar_state')
    .upsert({ id: 1, placements, updated_at: new Date().toISOString() });
}

const DETAILS_STORAGE_KEY = "dogppl-concept-details-v1";

async function loadConceptDetails() {
  if (!supabase) {
    try { const v = localStorage.getItem(DETAILS_STORAGE_KEY); return v ? JSON.parse(v) : {}; } catch(e){ return {}; }
  }
  const { data, error } = await supabase.from('concept_details').select('*');
  if (error || !data) return {};
  const map = {};
  for (const row of data) map[row.id] = row;
  return map;
}

async function saveConceptDetail(detail) {
  if (!supabase) {
    try {
      const v = JSON.parse(localStorage.getItem(DETAILS_STORAGE_KEY) || '{}');
      v[detail.id] = detail;
      localStorage.setItem(DETAILS_STORAGE_KEY, JSON.stringify(v));
    } catch(e) {}
    return { error: null };
  }
  return await supabase
    .from('concept_details')
    .upsert({ ...detail, updated_at: new Date().toISOString() });
}

function getConcept(id, details) {
  const base = CONCEPTS.find(c => c.id === id);
  const o = details && details[id];
  // Boneyard-born concepts live in concept_details with no entry in the
  // static CONCEPTS seed. Synthesize a minimal base so the sidebar, drag
  // sources, format mix, and panel can all resolve them by id alone.
  if (!base) {
    if (!o) return null;
    return {
      id,
      title: o.title || id,
      pillar: o.pillar || 'Brand',
      tier: o.tier || 'T3',
      note: o.description || '',
      preferred_format: o.preferred_format ?? null,
      status: o.status || 'approved',
    };
  }
  if (!o) return { ...base, status: 'approved' };
  return {
    ...base,
    title: o.title || base.title,
    pillar: o.pillar || base.pillar,
    tier: o.tier || base.tier,
    preferred_format: o.preferred_format ?? base.preferred_format,
    status: o.status || 'approved',
  };
}

const SCHEDULABLE_STATUSES = new Set(['approved', 'production']);

// Best-effort: once we have placements + concept details, write any
// past-dated placement into concept_deployments so the Boneyard's
// deployment history populates without manual entry. Idempotency relies
// on a unique constraint (concept_id, deployed_at, channel).
async function syncDeploymentsFromPlacements(placements, conceptDetails) {
  if (!supabase) return;
  const today = new Date(); today.setHours(0,0,0,0);
  const rows = [];
  for (const [dayId, conceptIds] of Object.entries(placements || {})) {
    const m = /^day-(\d+)-(\d+)-(\d+)$/.exec(dayId);
    if (!m) continue;
    const date = new Date(parseInt(m[1],10), parseInt(m[2],10), parseInt(m[3],10));
    if (date > today) continue;
    for (const cid of conceptIds) {
      const c = getConcept(cid, conceptDetails);
      if (!c) continue;
      if (c.pillar === 'Events') continue; // soft holds, not real publishings
      rows.push({
        concept_id: cid,
        deployed_at: date.toISOString().slice(0, 10),
        channel: c.preferred_format || 'Calendar',
        notes: null,
      });
    }
  }
  if (!rows.length) return;
  await supabase
    .from('concept_deployments')
    .upsert(rows, { onConflict: 'concept_id,deployed_at,channel', ignoreDuplicates: true });
}

function getEffectiveFormat(id, details) {
  const c = getConcept(id, details);
  if (!c) return "Unset";
  const d = details && details[id];
  if (d) {
    if (d.format_type === "Reel") return "Reel";
    if (d.format_type === "Story") return "Story";
    if (d.format_type === "Post") {
      const t = d.post_media_type;
      if (t === "Single still image") return "Single image";
      if (t === "Single video") return "Video";
      if (t === "Carousel of still images" || t === "Carousel of videos") return "Carousel";
    }
  }
  return c.preferred_format || "Unset";
}

function dayIdToDate(dayId) {
  const m = /^day-(\d+)-(\d+)-(\d+)$/.exec(dayId);
  if (!m) return null;
  return new Date(parseInt(m[1],10), parseInt(m[2],10), parseInt(m[3],10));
}

function isDayInWindow(dayId, windowKey, today) {
  const date = dayIdToDate(dayId);
  if (!date) return false;
  if (windowKey === "month") {
    return date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth();
  }
  const start = new Date(today); start.setDate(today.getDate() - 30);
  return date >= start && date <= today;
}

const PAST_DAYS_TO_CLEAR = [
  "day-2026-4-1","day-2026-4-2","day-2026-4-3","day-2026-4-4","day-2026-4-5",
  "day-2026-4-6","day-2026-4-7","day-2026-4-8","day-2026-4-9","day-2026-4-10","day-2026-4-11",
];

function mergeDefaults(stored) {
  // 1. Start with content defaults for weekdays
  const merged = {};
  for (const [dayId, concepts] of Object.entries(CONTENT_DEFAULTS)) {
    // Only apply content default if user hasn't touched this day
    merged[dayId] = stored && stored[dayId] ? [...stored[dayId]] : [...concepts];
  }
  // 2. Carry over any stored days not in content defaults
  if (stored) {
    for (const [dayId, concepts] of Object.entries(stored)) {
      if (!merged[dayId]) merged[dayId] = [...concepts];
    }
  }
  // 3. Layer timely defaults — add to any day, don't replace
  for (const [dayId, concepts] of Object.entries(TIMELY_DEFAULTS)) {
    if (!merged[dayId]) merged[dayId] = [];
    for (const cid of concepts) {
      if (!merged[dayId].includes(cid)) merged[dayId] = [...merged[dayId], cid];
    }
  }
  // 4. Layer events defaults
  for (const [dayId, concepts] of Object.entries(EVENTS_DEFAULTS)) {
    if (!merged[dayId]) merged[dayId] = [];
    for (const cid of concepts) {
      if (!merged[dayId].includes(cid)) merged[dayId] = [...merged[dayId], cid];
    }
  }
  // 5. Strip non-Events placements from stale past days (May 1–11, 2026)
  for (const dayId of PAST_DAYS_TO_CLEAR) {
    if (!merged[dayId]) continue;
    merged[dayId] = merged[dayId].filter(cid => {
      const c = CONCEPTS.find(x => x.id === cid);
      return c && c.pillar === "Events";
    });
    if (!merged[dayId].length) delete merged[dayId];
  }
  return merged;
}

function ConceptPanel({ conceptId, draft, setDraft, onClose, onSave, saving, uploading, onUpload, onRemoveMedia }) {
  const fileRef = useRef(null);
  if (!conceptId || !draft) return null;
  const pillarKeys = ["DOG","Culture","Bond","Edu","Brand","Timely","Paid","Events","Alerts","Partners"];
  const set = (k,v) => setDraft(d => d ? {...d, [k]: v} : d);

  function onFilePick(e) {
    const files = Array.from(e.target.files || []);
    if (files.length) onUpload(files);
    e.target.value = "";
  }
  function onDrop(e) {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length) onUpload(files);
  }

  const inputStyle = {width:"100%",background:"#FFF",border:`1px solid ${BRAND.sand}`,borderRadius:4,padding:"7px 9px",fontSize:13,fontFamily:"inherit",color:BRAND.paw,outline:"none",boxSizing:"border-box"};
  const labelStyle = {fontSize:10,letterSpacing:"0.1em",textTransform:"uppercase",color:BRAND.drySage,marginBottom:4,display:"block"};

  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(24,24,24,0.28)",zIndex:50,display:"flex",justifyContent:"flex-end"}}>
      <div onClick={e=>e.stopPropagation()} style={{width:400,maxWidth:"100vw",height:"100%",background:BRAND.bone,color:BRAND.paw,fontFamily:"'Georgia',serif",display:"flex",flexDirection:"column",boxShadow:"-4px 0 16px rgba(0,0,0,0.18)"}}>
        <div style={{padding:"14px 18px",borderBottom:`1px solid ${BRAND.sand}`,display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
          <div style={{minWidth:0,flex:1}}>
            <div style={{fontSize:10,letterSpacing:"0.12em",textTransform:"uppercase",color:BRAND.drySage}}>Concept</div>
            <div style={{fontSize:14,fontWeight:700,marginTop:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{draft.title || conceptId}</div>
          </div>
          <button onClick={onClose} aria-label="Close" style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:BRAND.drySage,padding:"0 4px",lineHeight:1}}>×</button>
        </div>

        <div style={{flex:1,overflowY:"auto",padding:"14px 18px",display:"flex",flexDirection:"column",gap:12}}>
          <div>
            <label style={labelStyle}>Title</label>
            <input value={draft.title||""} onChange={e=>set('title',e.target.value)} style={inputStyle}/>
          </div>
          <div style={{display:"flex",gap:8}}>
            <div style={{flex:1}}>
              <label style={labelStyle}>Pillar</label>
              <select value={draft.pillar||""} onChange={e=>set('pillar',e.target.value)} style={inputStyle}>
                {pillarKeys.map(pk=><option key={pk} value={pk}>{PILLARS[pk].label}</option>)}
              </select>
            </div>
            <div style={{width:92}}>
              <label style={labelStyle}>Tier</label>
              <select value={draft.tier||""} onChange={e=>set('tier',e.target.value)} style={inputStyle}>
                {["T1","T2","T3"].map(t=><option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label style={labelStyle}>Preferred format (default when placed)</label>
            <select value={draft.preferred_format||""} onChange={e=>set('preferred_format',e.target.value)} style={inputStyle}>
              <option value="">— None —</option>
              <option value="Reel">Reel</option>
              <option value="Carousel">Carousel</option>
              <option value="Single image">Single image</option>
              <option value="Video">Video</option>
              <option value="Story">Story</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Description</label>
            <textarea rows={3} value={draft.description||""} onChange={e=>set('description',e.target.value)} style={{...inputStyle,resize:"vertical",fontFamily:"inherit"}}/>
          </div>
          <div>
            <label style={labelStyle}>Caption</label>
            <textarea rows={4} value={draft.caption||""} onChange={e=>set('caption',e.target.value)} style={{...inputStyle,resize:"vertical",fontFamily:"inherit"}}/>
          </div>
          <div>
            <label style={labelStyle}>Format type</label>
            <select value={draft.format_type||""} onChange={e=>set('format_type',e.target.value)} style={inputStyle}>
              <option value="">— Select —</option>
              <option value="Post">Post</option>
              <option value="Story">Story</option>
              <option value="Reel">Reel</option>
            </select>
          </div>

          {draft.format_type === "Post" && (
            <>
              <div>
                <label style={labelStyle}>Post media type</label>
                <select value={draft.post_media_type||""} onChange={e=>set('post_media_type',e.target.value)} style={inputStyle}>
                  <option value="">— Select —</option>
                  <option value="Single still image">Single still image</option>
                  <option value="Carousel of still images">Carousel of still images</option>
                  <option value="Single video">Single video</option>
                  <option value="Carousel of videos">Carousel of videos</option>
                </select>
              </div>
              {(draft.post_media_type === "Carousel of still images" || draft.post_media_type === "Carousel of videos") && (
                <div>
                  <label style={labelStyle}>Carousel count</label>
                  <input type="number" min={2} value={draft.post_carousel_count ?? ""} onChange={e=>set('post_carousel_count', e.target.value ? parseInt(e.target.value,10) : null)} style={inputStyle}/>
                </div>
              )}
            </>
          )}

          {draft.format_type === "Story" && (
            <>
              <div>
                <label style={labelStyle}>Story media type</label>
                <select value={draft.story_media_type||""} onChange={e=>set('story_media_type',e.target.value)} style={inputStyle}>
                  <option value="">— Select —</option>
                  <option value="Still image">Still image</option>
                  <option value="Video">Video</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>CTA copy (optional)</label>
                <input value={draft.story_cta_copy||""} onChange={e=>set('story_cta_copy',e.target.value)} style={inputStyle}/>
              </div>
              <div>
                <label style={labelStyle}>CTA link (optional)</label>
                <input type="url" placeholder="https://" value={draft.story_cta_link||""} onChange={e=>set('story_cta_link',e.target.value)} style={inputStyle}/>
              </div>
            </>
          )}

          <div>
            <label style={labelStyle}>Media</label>
            <div onDragOver={e=>e.preventDefault()} onDrop={onDrop} onClick={()=>fileRef.current?.click()}
              style={{border:`1px dashed ${BRAND.sand}`,borderRadius:4,padding:"16px 12px",textAlign:"center",cursor:"pointer",background:"#FFF",color:BRAND.drySage,fontSize:12}}>
              {uploading ? "Uploading…" : "Drop images or videos here, or click to choose"}
            </div>
            <input ref={fileRef} type="file" multiple accept="image/*,video/*" onChange={onFilePick} style={{display:"none"}}/>
            {draft.media && draft.media.length > 0 && (
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6,marginTop:8}}>
                {draft.media.map((m,i)=>(
                  <div key={(m && m.url) || i} style={{position:"relative",borderRadius:4,overflow:"hidden",background:"#EEE",aspectRatio:"1/1"}}>
                    {m && m.type && m.type.startsWith("video") ? (
                      <video src={m.url} muted style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                    ) : (
                      <img src={m && m.url} alt={(m && m.name)||""} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                    )}
                    <button onClick={()=>onRemoveMedia(m)} aria-label="Remove" style={{position:"absolute",top:3,right:3,background:"rgba(24,24,24,0.78)",color:"#fff",border:"none",borderRadius:10,width:18,height:18,fontSize:11,cursor:"pointer",lineHeight:1,padding:0}}>×</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={{padding:"10px 18px 4px",fontSize:11,textAlign:"center"}}>
          <a href={`https://boneyard.dogppl.co/c/${encodeURIComponent(conceptId)}`} target="_blank" rel="noopener"
             style={{fontFamily:"ui-monospace, 'JetBrains Mono', monospace",fontSize:10,letterSpacing:"0.12em",textTransform:"uppercase",color:BRAND.mud,textDecoration:"none"}}>
            Open in Boneyard →
          </a>
        </div>
        <div style={{padding:"8px 18px 12px",borderTop:`1px solid ${BRAND.sand}`,display:"flex",gap:8,flexShrink:0,background:BRAND.bone}}>
          <button onClick={onSave} disabled={saving} style={{flex:1,background:BRAND.paw,color:BRAND.bone,border:"none",borderRadius:4,padding:"9px 14px",fontFamily:"inherit",fontSize:13,fontWeight:600,cursor:saving?"default":"pointer",opacity:saving?0.6:1}}>
            {saving ? "Saving…" : "Save"}
          </button>
          <button onClick={onClose} style={{background:"transparent",color:BRAND.drySage,border:`1px solid ${BRAND.sand}`,borderRadius:4,padding:"9px 14px",fontFamily:"inherit",fontSize:13,cursor:"pointer"}}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (!supabase) { setAuthChecked(true); return; }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthChecked(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  if (!authChecked) return <div style={{minHeight:"100vh",background:BRAND.bone}}/>;
  if (supabase && !session) return <Login />;

  return <Calendar onSignOut={supabase ? () => supabase.auth.signOut() : null} />;
}

function Calendar({ onSignOut }) {
  const [placements, setPlacements] = useState({});
  const [drag, setDrag] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [filterPillar, setFilterPillar] = useState("ALL");
  const [filterTier, setFilterTier] = useState("ALL");
  const [search, setSearch] = useState("");
  const [month, setMonth] = useState(4);
  const [hoverDay, setHoverDay] = useState(null);

  const [conceptDetails, setConceptDetails] = useState({});
  const [selectedConceptId, setSelectedConceptId] = useState(null);
  const [panelDraft, setPanelDraft] = useState(null);
  const [savingPanel, setSavingPanel] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [formatWindow, setFormatWindow] = useState(() => {
    try { return localStorage.getItem("dogppl-format-window") || "30d"; } catch(e) { return "30d"; }
  });
  useEffect(() => {
    try { localStorage.setItem("dogppl-format-window", formatWindow); } catch(e) {}
  }, [formatWindow]);

  const [sidebarWidth, setSidebarWidth] = useState(() => {
    try {
      const v = parseInt(localStorage.getItem("dogppl-sidebar-width") || "", 10);
      if (!Number.isFinite(v)) return 248;
      return Math.min(480, Math.max(240, v));
    } catch(e) { return 248; }
  });
  useEffect(() => {
    try { localStorage.setItem("dogppl-sidebar-width", String(sidebarWidth)); } catch(e) {}
  }, [sidebarWidth]);

  const [trackerCollapsed, setTrackerCollapsed] = useState(() => {
    try { return localStorage.getItem("dogppl-tracker-collapsed") === "1"; } catch(e) { return false; }
  });
  useEffect(() => {
    try { localStorage.setItem("dogppl-tracker-collapsed", trackerCollapsed ? "1" : "0"); } catch(e) {}
  }, [trackerCollapsed]);

  const [calendarSearch, setCalendarSearch] = useState("");

  function startSidebarResize(e) {
    e.preventDefault();
    const onMove = (ev) => {
      const w = Math.min(480, Math.max(240, ev.clientX));
      setSidebarWidth(w);
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }

  function matchesCalendarSearch(concept) {
    if (!calendarSearch) return true;
    const q = calendarSearch.toLowerCase();
    if ((concept.title || "").toLowerCase().includes(q)) return true;
    if ((concept.pillar || "").toLowerCase().includes(q)) return true;
    if ((concept.tier || "").toLowerCase().includes(q)) return true;
    const detail = conceptDetails[concept.id];
    if (detail) {
      if ((detail.description || "").toLowerCase().includes(q)) return true;
      if ((detail.caption || "").toLowerCase().includes(q)) return true;
    }
    return false;
  }

  const saveTimer = useRef(null);
  const [syncing, setSyncing] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  // Load initial state
  useEffect(() => {
    Promise.all([loadFromSupabase(), loadConceptDetails()]).then(([stored, details]) => {
      const merged = mergeDefaults(stored);
      setPlacements(merged);
      setConceptDetails(details || {});
      setLoaded(true);
      // Best-effort deployment auto-sync — don't block UI or surface errors.
      syncDeploymentsFromPlacements(merged, details || {}).catch(err => {
        console.warn('Deployment auto-sync skipped:', err?.message || err);
      });
    });
  }, []);

  // Debounced save on change
  useEffect(() => {
    if (!loaded) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSyncing(true);
      await saveToSupabase(placements);
      setSyncing(false);
      setLastSaved(new Date());
    }, 800);
    return () => clearTimeout(saveTimer.current);
  }, [placements, loaded]);

  // Real-time sync from other clients
  useEffect(() => {
    if (!supabase || !loaded) return;
    const channel = supabase
      .channel('calendar-sync')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'calendar_state',
        filter: 'id=eq.1'
      }, (payload) => {
        if (payload.new?.placements) {
          setPlacements(payload.new.placements);
        }
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [loaded]);

  // Real-time sync for concept_details
  useEffect(() => {
    if (!supabase || !loaded) return;
    const channel = supabase
      .channel('concept-details-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'concept_details' }, (payload) => {
        if (payload.eventType === 'DELETE') {
          setConceptDetails(prev => {
            const next = {...prev};
            if (payload.old && payload.old.id) delete next[payload.old.id];
            return next;
          });
        } else if (payload.new) {
          setConceptDetails(prev => ({...prev, [payload.new.id]: payload.new}));
        }
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [loaded]);

  const usedIds = new Set(Object.values(placements).flat());
  // Only "schedulable" concepts (approved + production) populate the
  // calendar's sidebar and coverage charts. Sketches, deployed, and
  // buried concepts live in the Boneyard but disappear here. Union the
  // static seed with any boneyard-born concept_details rows so concepts
  // created in the Boneyard show up here once they hit production.
  const allConceptIds = (() => {
    const ids = new Set(CONCEPTS.map(c => c.id));
    for (const k of Object.keys(conceptDetails || {})) ids.add(k);
    return ids;
  })();
  const effectiveConcepts = [...allConceptIds]
    .map(id => getConcept(id, conceptDetails))
    .filter(c => c && SCHEDULABLE_STATUSES.has(c.status));
  const filtered = effectiveConcepts
    .filter(c => {
      if (filterPillar !== "ALL" && c.pillar !== filterPillar) return false;
      if (filterTier !== "ALL" && c.tier !== filterTier) return false;
      if (search && !c.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => Number(usedIds.has(a.id)) - Number(usedIds.has(b.id)));

  // Cycle stats for visible month
  const monthDays = ALL_DAYS.filter(d => d.month === month);
  const monthCycleStats = {};
  let runCore = 0;
  for (const d of monthDays) {
    for (const cid of (placements[d.id]||[])) {
      const c = getConcept(cid, conceptDetails);
      if (c && CORE_PILLARS.includes(c.pillar)) {
        const cyc = Math.floor(runCore/10)+1;
        if (!monthCycleStats[cyc]) monthCycleStats[cyc] = {DOG:0,Culture:0,Bond:0,Edu:0,Brand:0,total:0};
        monthCycleStats[cyc][c.pillar]++;
        monthCycleStats[cyc].total++;
        runCore++;
      }
    }
  }
  const completeCycles = Object.values(monthCycleStats).filter(s=>s.total>=10).length;

  function onDragStart(e, concept, fromDay) { setDrag({concept, fromDay}); e.dataTransfer.effectAllowed="move"; }
  function onDragOver(e) { e.preventDefault(); }
  function onDropDay(e, dayId) {
    e.preventDefault(); if(!drag) return;
    const {concept, fromDay} = drag;
    setPlacements(prev => {
      const next = {...prev};
      if(fromDay) { next[fromDay]=(next[fromDay]||[]).filter(id=>id!==concept.id); if(!next[fromDay].length) delete next[fromDay]; }
      if(!next[dayId]) next[dayId]=[];
      if(!next[dayId].includes(concept.id)) next[dayId]=[...next[dayId],concept.id];
      return next;
    });
    setDrag(null); setHoverDay(null);
  }
  function onDropLib(e) {
    e.preventDefault(); if(!drag||!drag.fromDay){setDrag(null);return;}
    const {concept,fromDay}=drag;
    setPlacements(prev=>{const next={...prev};next[fromDay]=(next[fromDay]||[]).filter(id=>id!==concept.id);if(!next[fromDay].length)delete next[fromDay];return next;});
    setDrag(null);
  }
  function remove(cid, dayId) {
    setPlacements(prev=>{const next={...prev};next[dayId]=(next[dayId]||[]).filter(id=>id!==cid);if(!next[dayId].length)delete next[dayId];return next;});
  }

  // Concept arriving via "Send to Calendar" deep-link. Sidebar highlights
  // it until it lands on a day; once a placement exists we clear it.
  const [needsPlacementId, setNeedsPlacementId] = useState(null);

  // Read ?concept=<id>[&place=1] on load. With place=1 we don't open the
  // panel — we surface the concept in the sidebar in a "needs placement"
  // state so the user can drag it onto a day.
  useEffect(() => {
    if (!loaded) return;
    const url = new URL(window.location.href);
    const wanted = url.searchParams.get('concept');
    const place = url.searchParams.get('place') === '1';
    if (!wanted) return;
    const c = getConcept(wanted, conceptDetails);
    if (c) {
      if (place) {
        // Reset filters so the concept isn't filtered out, then mark it
        // for the highlight treatment in the sidebar.
        setFilterPillar('ALL');
        setFilterTier('ALL');
        setSearch('');
        setNeedsPlacementId(wanted);
      } else {
        openPanel(wanted);
      }
    }
    url.searchParams.delete('concept');
    url.searchParams.delete('place');
    window.history.replaceState({}, '', url.pathname + (url.search || ''));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded]);

  // Clear the needs-placement highlight once the concept is actually
  // placed somewhere on the calendar.
  useEffect(() => {
    if (!needsPlacementId) return;
    if (usedIds.has(needsPlacementId)) setNeedsPlacementId(null);
  }, [usedIds, needsPlacementId]);

  function openPanel(id) {
    const resolved = getConcept(id, conceptDetails);
    if (!resolved) return;
    const stored = conceptDetails[id] || {};
    setPanelDraft({
      id,
      title: stored.title ?? resolved.title,
      pillar: stored.pillar ?? resolved.pillar,
      tier: stored.tier ?? resolved.tier,
      preferred_format: stored.preferred_format ?? resolved.preferred_format ?? "",
      description: stored.description ?? resolved.note ?? "",
      caption: stored.caption ?? "",
      format_type: stored.format_type ?? "",
      post_media_type: stored.post_media_type ?? "",
      post_carousel_count: stored.post_carousel_count ?? null,
      story_media_type: stored.story_media_type ?? "",
      story_cta_copy: stored.story_cta_copy ?? "",
      story_cta_link: stored.story_cta_link ?? "",
      media: Array.isArray(stored.media) ? stored.media : [],
    });
    setSelectedConceptId(id);
  }

  function closePanel() {
    setSelectedConceptId(null);
    setPanelDraft(null);
  }

  async function savePanel() {
    if (!panelDraft) return;
    setSavingPanel(true);
    const detail = {
      id: panelDraft.id,
      title: panelDraft.title || null,
      pillar: panelDraft.pillar || null,
      tier: panelDraft.tier || null,
      preferred_format: panelDraft.preferred_format || null,
      description: panelDraft.description || null,
      caption: panelDraft.caption || null,
      format_type: panelDraft.format_type || null,
      post_media_type: panelDraft.post_media_type || null,
      post_carousel_count: panelDraft.post_carousel_count || null,
      story_media_type: panelDraft.story_media_type || null,
      story_cta_copy: panelDraft.story_cta_copy || null,
      story_cta_link: panelDraft.story_cta_link || null,
      media: panelDraft.media || [],
    };
    const res = await saveConceptDetail(detail);
    if (!res || !res.error) {
      setConceptDetails(prev => ({...prev, [detail.id]: detail}));
    }
    setSavingPanel(false);
  }

  async function handleUploadMedia(files) {
    if (!selectedConceptId) return;
    setUploadingMedia(true);
    try {
      const uploaded = [];
      for (const file of files) {
        if (!supabase) {
          uploaded.push({ name: file.name, type: file.type, url: URL.createObjectURL(file), path: null });
          continue;
        }
        const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const path = `${selectedConceptId}/${Date.now()}-${safe}`;
        const { error } = await supabase.storage.from('concept-media').upload(path, file, { upsert: false });
        if (error) { console.error(error); continue; }
        const { data: pub } = supabase.storage.from('concept-media').getPublicUrl(path);
        uploaded.push({ name: file.name, type: file.type, url: pub.publicUrl, path });
      }
      setPanelDraft(d => d ? {...d, media: [...(d.media||[]), ...uploaded]} : d);
    } finally {
      setUploadingMedia(false);
    }
  }

  async function handleRemoveMedia(item) {
    if (supabase && item && item.path) {
      try { await supabase.storage.from('concept-media').remove([item.path]); } catch(e) { console.error(e); }
    }
    setPanelDraft(d => d ? {...d, media: (d.media||[]).filter(m => m !== item)} : d);
  }

  const totalPlaced = Object.values(placements).flat().length;
  const weeks = getWeeksInMonth(month);

  // Find-style search navigation. Matches are placements in the current
  // month view, ordered chronologically; activeMatchIndex tracks which
  // one is "selected" by the up/down/Enter controls.
  const searchMatches = [];
  if (calendarSearch) {
    for (const week of weeks) {
      for (const day of week) {
        if (!day) continue;
        const ids = placements[day.id] || [];
        for (const cid of ids) {
          const c = getConcept(cid, conceptDetails);
          if (c && matchesCalendarSearch(c)) {
            searchMatches.push({ dayId: day.id, conceptId: cid, key: `${day.id}::${cid}` });
          }
        }
      }
    }
  }
  const matchKeyToIndex = {};
  searchMatches.forEach((m, i) => { matchKeyToIndex[m.key] = i; });

  const [activeMatchIndex, setActiveMatchIndex] = useState(0);
  const matchRefs = useRef(new Map());
  const matchCount = searchMatches.length;

  // Reset position when the query changes.
  useEffect(() => { setActiveMatchIndex(0); }, [calendarSearch]);

  // Reset when switching months (matches recomputed against new view).
  useEffect(() => { setActiveMatchIndex(0); }, [month]);

  // Clamp if matches shrink (e.g. user added more characters).
  useEffect(() => {
    if (matchCount === 0) return;
    if (activeMatchIndex >= matchCount) setActiveMatchIndex(0);
  }, [matchCount, activeMatchIndex]);

  // Scroll active match into view when it changes.
  useEffect(() => {
    if (!calendarSearch || matchCount === 0) return;
    const m = searchMatches[activeMatchIndex];
    if (!m) return;
    const el = matchRefs.current.get(m.key);
    if (el && typeof el.scrollIntoView === 'function') {
      el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMatchIndex, calendarSearch, matchCount]);

  function stepMatch(dir) {
    if (matchCount === 0) return;
    setActiveMatchIndex(i => (i + dir + matchCount) % matchCount);
  }

  function onSearchKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      stepMatch(e.shiftKey ? -1 : 1);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setCalendarSearch("");
    }
  }

  // Format mix over selected window — skip Events (soft holds)
  const today = new Date(); today.setHours(0,0,0,0);
  const formatCounts = { Reel:0, Carousel:0, "Single image":0, Video:0, Story:0, Unset:0 };
  for (const [dayId, conceptIds] of Object.entries(placements)) {
    if (!isDayInWindow(dayId, formatWindow, today)) continue;
    for (const cid of conceptIds) {
      const c = getConcept(cid, conceptDetails);
      if (!c || c.pillar === "Events") continue;
      const fmt = getEffectiveFormat(cid, conceptDetails);
      formatCounts[fmt] = (formatCounts[fmt] || 0) + 1;
    }
  }
  const mixTotal = formatCounts.Reel + formatCounts.Carousel + formatCounts["Single image"] + formatCounts.Video + formatCounts.Unset;
  const storyCount = formatCounts.Story;

  // Pillar + tier coverage counters (unique concept IDs only)
  const pillarStats = {};
  const tierStats = {};
  for (const c of effectiveConcepts) {
    if (!pillarStats[c.pillar]) pillarStats[c.pillar] = { total: 0, placed: 0 };
    pillarStats[c.pillar].total++;
    if (usedIds.has(c.id)) pillarStats[c.pillar].placed++;
    if (!tierStats[c.tier]) tierStats[c.tier] = { total: 0, placed: 0 };
    tierStats[c.tier].total++;
    if (usedIds.has(c.id)) tierStats[c.tier].placed++;
  }

  return (
    <div style={{display:"flex",height:"100vh",fontFamily:"'Georgia',serif",background:BRAND.bone,color:BRAND.paw,overflow:"hidden"}}>
      {/* SIDEBAR */}
      <div style={{width:sidebarWidth,flexShrink:0,background:BRAND.paw,color:BRAND.bone,display:"flex",flexDirection:"column",overflow:"hidden",fontFamily:"system-ui, -apple-system, 'Segoe UI', sans-serif",position:"relative"}}
        onDragOver={onDragOver} onDrop={onDropLib}>
        <div
          onMouseDown={startSidebarResize}
          onDoubleClick={()=>setSidebarWidth(248)}
          title="Drag to resize · Double-click to reset"
          style={{position:"absolute",top:0,right:-3,bottom:0,width:6,cursor:"col-resize",zIndex:10}}
        />
        <div style={{padding:"14px 13px 10px",borderBottom:"1px solid #2a2a2a"}}>
          <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",marginBottom:6}}>
            <div style={{fontSize:10,letterSpacing:"0.14em",textTransform:"uppercase",color:BRAND.sand}}>The Boneyard</div>
            <a href="https://boneyard.dogppl.co" target="_blank" rel="noopener" style={{fontFamily:"ui-monospace, 'JetBrains Mono', monospace",fontSize:9,letterSpacing:"0.12em",textTransform:"uppercase",color:BRAND.mud,textDecoration:"none"}}>Open full vault →</a>
          </div>
          <div style={{position:"relative",marginTop:2}}>
            <span style={{position:"absolute",left:8,top:"50%",transform:"translateY(-50%)",fontSize:11,color:BRAND.sand,pointerEvents:"none"}}>⌕</span>
            <input
              value={search}
              onChange={e=>setSearch(e.target.value)}
              placeholder="Search concepts by name…"
              style={{
                width:"100%",
                background:"#1e1e1e",
                border:`1px solid ${search ? BRAND.sand : "#2e2e2e"}`,
                borderRadius:4,
                padding:"7px 26px 7px 22px",
                fontSize:13,
                color:BRAND.bone,
                outline:"none",
                boxSizing:"border-box",
                fontFamily:"inherit",
              }}
            />
            {search && (
              <button
                type="button"
                onClick={()=>setSearch("")}
                aria-label="Clear search"
                style={{position:"absolute",right:6,top:"50%",transform:"translateY(-50%)",background:"transparent",border:"none",color:"#9a9a9a",fontSize:14,cursor:"pointer",padding:"0 4px",lineHeight:1}}
              >×</button>
            )}
          </div>
          <div style={{display:"flex",gap:3,marginTop:7,flexWrap:"wrap"}}>
            {["ALL","DOG","Culture","Bond","Edu","Brand","Timely","Paid","Events","Alerts","Partners"].map(p=>(
              <button key={p} onClick={()=>setFilterPillar(p)} className={`lib-chip${filterPillar===p?" is-active":""}`} style={{letterSpacing:"0.04em",textTransform:"uppercase",background:filterPillar===p?(PILLARS[p]?.color||BRAND.grass):undefined}}>{p}</button>
            ))}
          </div>
          <div style={{display:"flex",gap:3,marginTop:5}}>
            {["ALL","T1","T2","T3"].map(t=>(
              <button key={t} onClick={()=>setFilterTier(t)} className={`lib-chip${filterTier===t?" is-active":""}`} style={{background:filterTier===t?BRAND.grass:undefined}}>{t==="ALL"?"All Tiers":t}</button>
            ))}
          </div>
          <div style={{fontSize:10,color:"#a0a0a0",marginTop:5}}>{filtered.length} shown · {totalPlaced} placed</div>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"6px 10px"}}>
          {filtered.map(c=>{
            const placed=usedIds.has(c.id);
            const p=PILLARS[c.pillar]||PILLARS.Brand;
            const needsPlacement = c.id === needsPlacementId;
            return (
              <div
                key={c.id}
                ref={needsPlacement ? (el => el && el.scrollIntoView({block:"nearest"})) : undefined}
                draggable
                onDragStart={e=>onDragStart(e,c,null)}
                onClick={()=>openPanel(c.id)}
                style={{
                  background: needsPlacement ? "#3a3a2e" : (placed?"#2e2e2e":"#242424"),
                  borderLeft: `3px solid ${needsPlacement ? "#E5BC2A" : (placed?p.color+"cc":p.color)}`,
                  border: `1px solid ${needsPlacement ? "#E5BC2A" : (placed?"#3a3a3a":"#333")}`,
                  borderLeftWidth: 3,
                  borderRadius: 4,
                  padding: "6px 8px",
                  marginBottom: 4,
                  cursor: "grab",
                  boxShadow: needsPlacement ? "0 0 0 1px #E5BC2A66" : undefined,
                }}
              >
                <div style={{fontSize:14,fontWeight:placed?500:600,color:placed?"#c4c4c4":BRAND.bone,lineHeight:1.35}}>{c.title}</div>
                <div style={{display:"flex",gap:5,marginTop:4,alignItems:"center"}}>
                  <span style={{fontSize:10,fontWeight:600,color:placed?(p.sidebarColor||p.color)+"d9":(p.sidebarColor||p.color),textTransform:"uppercase",letterSpacing:"0.06em"}}>{c.pillar}</span>
                  <span style={{fontSize:10,color:"#a0a0a0"}}>·</span>
                  <span style={{fontSize:10,color:"#a0a0a0"}}>{c.tier}</span>
                  {needsPlacement && <span style={{fontSize:10,color:"#E5BC2A",marginLeft:"auto",textTransform:"uppercase",letterSpacing:"0.08em",fontWeight:600}}>needs placement</span>}
                  {!needsPlacement && placed && <span style={{fontSize:10,color:"#b8b8b8",marginLeft:"auto"}}>placed</span>}
                </div>
              </div>
            );
          })}
        </div>
        {/* STATS PANEL */}
        <div style={{borderTop:"1px solid #252525",padding:"10px 12px",flexShrink:0}}>
          <div style={{fontSize:9,letterSpacing:"0.12em",textTransform:"uppercase",color:"#a0a0a0",marginBottom:7}}>Coverage</div>
          {/* By Pillar */}
          {["DOG","Culture","Bond","Edu","Brand","Timely","Paid","Events","Alerts","Partners"].map(pk => {
            const p = PILLARS[pk] || PILLARS.Brand;
            const s = pillarStats[pk] || {total:0,placed:0};
            const pct = s.total ? Math.round((s.placed/s.total)*100) : 0;
            const remaining = s.total - s.placed;
            return (
              <div key={pk} style={{marginBottom:5}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:2}}>
                  <span style={{fontSize:9,color:p.color,textTransform:"uppercase",letterSpacing:"0.05em",fontWeight:600}}>{pk}</span>
                  <span style={{fontSize:9,color: pct===100?"#4a8a2a":"#c0c0c0"}}>
                    {s.placed}/{s.total}
                    {remaining>0 && <span style={{color:"#a0a0a0"}}> · {remaining} left</span>}
                    {pct===100 && <span style={{color:"#4a8a2a"}}> ✓</span>}
                  </span>
                </div>
                <div style={{height:3,background:"#222",borderRadius:2,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${pct}%`,background:p.color,borderRadius:2,transition:"width 0.3s"}}/>
                </div>
              </div>
            );
          })}
          {/* By Tier */}
          <div style={{marginTop:8,marginBottom:5,fontSize:9,letterSpacing:"0.1em",textTransform:"uppercase",color:"#a0a0a0"}}>By Tier</div>
          <div style={{display:"flex",gap:6}}>
            {["T1","T2","T3"].map(t => {
              const s = tierStats[t] || {total:0,placed:0};
              const pct = s.total ? Math.round((s.placed/s.total)*100) : 0;
              return (
                <div key={t} style={{flex:1,background:"#1a1a1a",borderRadius:4,padding:"6px 7px",textAlign:"center"}}>
                  <div style={{fontSize:11,fontWeight:700,color:pct===100?"#4a8a2a":BRAND.bone}}>{s.placed}</div>
                  <div style={{fontSize:8,color:"#a0a0a0",marginTop:1}}>of {s.total}</div>
                  <div style={{height:2,background:"#222",borderRadius:1,overflow:"hidden",marginTop:4}}>
                    <div style={{height:"100%",width:`${pct}%`,background:pct===100?"#4a8a2a":BRAND.grass,transition:"width 0.3s"}}/>
                  </div>
                  <div style={{fontSize:9,color:"#c0c0c0",marginTop:3,fontWeight:600}}>{t}</div>
                </div>
              );
            })}
          </div>

          {/* Format mix */}
          <div style={{marginTop:12,display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
            <span style={{fontSize:9,letterSpacing:"0.12em",textTransform:"uppercase",color:"#a0a0a0"}}>Format mix</span>
            <div style={{display:"flex",gap:3}}>
              {[["30d","30-day"],["month","This month"]].map(([key,label])=>(
                <button key={key} onClick={()=>setFormatWindow(key)} style={{fontSize:9,padding:"2px 6px",borderRadius:10,cursor:"pointer",border:formatWindow===key?"none":"1px solid #333",background:formatWindow===key?BRAND.grass:"transparent",color:formatWindow===key?"#fff":BRAND.drySage,fontFamily:"inherit"}}>{label}</button>
              ))}
            </div>
          </div>
          {[
            {key:"Reel",          label:"Reels",        target:50, color:PILLARS.DOG.color},
            {key:"Carousel",      label:"Carousels",    target:30, color:PILLARS.Culture.color},
            {key:"Single image",  label:"Single image", target:15, color:BRAND.mud},
            {key:"Video",         label:"Video",        target:null, color:BRAND.darkGrass},
          ].map(row => {
            const count = formatCounts[row.key] || 0;
            const pct = mixTotal ? Math.round((count/mixTotal)*100) : 0;
            const below = row.target != null && pct < row.target;
            return (
              <div key={row.key} style={{marginBottom:5}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:2}}>
                  <span style={{fontSize:9,color:"#d0d0d0",textTransform:"uppercase",letterSpacing:"0.05em",fontWeight:600}}>{row.label}</span>
                  <span style={{fontSize:9,color:"#c0c0c0"}}>
                    {count}{mixTotal?` · ${pct}%`:""}
                    {row.target!=null && <span style={{color:"#a0a0a0"}}> / target {row.target}%</span>}
                  </span>
                </div>
                <div style={{height:3,background:"#222",borderRadius:2,overflow:"hidden",position:"relative"}}>
                  <div style={{height:"100%",width:`${Math.min(pct,100)}%`,background:row.color,transition:"width 0.3s"}}/>
                  {row.target!=null && (
                    <div style={{position:"absolute",left:`${row.target}%`,top:-1,bottom:-1,width:1,background:"#777",opacity:0.55}}/>
                  )}
                </div>
                {below && (
                  <div style={{fontSize:9,color:"#aaaaaa",marginTop:2,fontStyle:"italic"}}>{row.target - pct}% headroom to target</div>
                )}
              </div>
            );
          })}
          <div style={{fontSize:9,color:"#c0c0c0",marginTop:6}}>
            {storyCount} {storyCount===1?"story":"stories"} scheduled this window
          </div>
          <div style={{fontSize:9,color:"#9a9a9a",marginTop:8,lineHeight:1.5}}>Drag to calendar · Drag back to remove</div>
        </div>
      </div>

      {/* MAIN */}
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        <div style={{background:BRAND.bone,borderBottom:`1px solid ${BRAND.sand}`,padding:"10px 18px",display:"flex",alignItems:"center",gap:14,flexShrink:0}}>
          <div>
            <div style={{fontSize:10,letterSpacing:"0.12em",textTransform:"uppercase",color:BRAND.drySage}}>DOG PPL</div>
            <div style={{fontSize:17,fontWeight:700,lineHeight:1.2}}>Content Calendar 2026</div>
          </div>
          <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:4}}>
            <div style={{display:"flex",alignItems:"center",gap:6,marginRight:8}}>
              <div style={{position:"relative"}}>
                <span style={{position:"absolute",left:9,top:"50%",transform:"translateY(-50%)",fontSize:12,color:BRAND.drySage,pointerEvents:"none"}}>⌕</span>
                <input
                  value={calendarSearch}
                  onChange={e=>setCalendarSearch(e.target.value)}
                  onKeyDown={onSearchKeyDown}
                  placeholder="Search calendar…"
                  style={{
                    width:200,
                    background:"#FFF",
                    border:`1px solid ${calendarSearch ? BRAND.paw : BRAND.sand}`,
                    borderRadius:20,
                    padding:"5px 26px 5px 24px",
                    fontSize:12,
                    color:BRAND.paw,
                    outline:"none",
                    boxSizing:"border-box",
                    fontFamily:"inherit",
                  }}
                />
                {calendarSearch && (
                  <button
                    type="button"
                    onClick={()=>setCalendarSearch("")}
                    aria-label="Clear calendar search"
                    style={{position:"absolute",right:6,top:"50%",transform:"translateY(-50%)",background:"transparent",border:"none",color:BRAND.drySage,fontSize:14,cursor:"pointer",padding:"0 4px",lineHeight:1}}
                  >×</button>
                )}
              </div>
              {calendarSearch && (
                <div style={{display:"flex",alignItems:"center",gap:4,fontFamily:"inherit"}}>
                  <span
                    aria-live="polite"
                    style={{fontSize:11,color:matchCount===0?BRAND.rust:BRAND.drySage,minWidth:60,textAlign:"center",fontWeight:matchCount===0?600:400}}
                  >
                    {matchCount===0 ? "No matches" : `${activeMatchIndex+1} of ${matchCount}`}
                  </span>
                  <button
                    type="button"
                    onClick={()=>stepMatch(-1)}
                    disabled={matchCount===0}
                    aria-label="Previous match"
                    title="Previous match (Shift+Enter)"
                    style={{background:"transparent",border:`1px solid ${BRAND.sand}`,borderRadius:4,width:22,height:22,cursor:matchCount===0?"default":"pointer",color:matchCount===0?BRAND.sand:BRAND.drySage,fontFamily:"inherit",fontSize:11,padding:0,display:"flex",alignItems:"center",justifyContent:"center",opacity:matchCount===0?0.5:1}}
                  >▲</button>
                  <button
                    type="button"
                    onClick={()=>stepMatch(1)}
                    disabled={matchCount===0}
                    aria-label="Next match"
                    title="Next match (Enter)"
                    style={{background:"transparent",border:`1px solid ${BRAND.sand}`,borderRadius:4,width:22,height:22,cursor:matchCount===0?"default":"pointer",color:matchCount===0?BRAND.sand:BRAND.drySage,fontFamily:"inherit",fontSize:11,padding:0,display:"flex",alignItems:"center",justifyContent:"center",opacity:matchCount===0?0.5:1}}
                  >▼</button>
                </div>
              )}
            </div>
            {[4,5,6,7,8,9,10,11].map(m=>(
              <button key={m} onClick={()=>setMonth(m)} style={{fontSize:12,padding:"4px 11px",borderRadius:20,fontFamily:"inherit",cursor:"pointer",border:`1px solid ${month===m?BRAND.paw:BRAND.sand}`,background:month===m?BRAND.paw:"transparent",color:month===m?BRAND.bone:BRAND.drySage}}>{MONTH_NAMES[m]}</button>
            ))}
            {onSignOut && (
              <button onClick={onSignOut} title="Sign out" style={{fontSize:11,padding:"4px 10px",borderRadius:20,fontFamily:"inherit",cursor:"pointer",border:`1px solid ${BRAND.sand}`,background:"transparent",color:BRAND.drySage,marginLeft:8}}>Sign out</button>
            )}
          </div>
        </div>

        <div style={{background:"#F8F7F4",borderBottom:`1px solid ${BRAND.sand}`,padding:trackerCollapsed?"6px 18px":"8px 18px",flexShrink:0}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:trackerCollapsed?0:6,flexWrap:"wrap"}}>
            <button
              type="button"
              onClick={()=>setTrackerCollapsed(v=>!v)}
              title={trackerCollapsed?"Expand cycle tracker":"Collapse cycle tracker"}
              aria-label={trackerCollapsed?"Expand cycle tracker":"Collapse cycle tracker"}
              style={{background:"transparent",border:"none",cursor:"pointer",color:BRAND.drySage,fontSize:11,padding:"0 2px",lineHeight:1,flexShrink:0,fontFamily:"inherit"}}
            >{trackerCollapsed?"▸":"▾"}</button>
            <span style={{fontSize:10,letterSpacing:"0.1em",textTransform:"uppercase",color:BRAND.drySage,flexShrink:0}}>3-2-2-2-1 per 10 posts {trackerCollapsed?"":"→"}</span>
            {!trackerCollapsed && CORE_PILLARS.map(pk=>{const p=PILLARS[pk];return(<span key={pk} style={{fontSize:10,padding:"2px 9px",borderRadius:10,background:p.bg,color:p.color,fontWeight:600,letterSpacing:"0.04em",flexShrink:0}}>{p.label} ×{CYCLE_TARGET[pk]}</span>);})}
            <span style={{marginLeft:"auto",fontSize:10,color:BRAND.drySage,flexShrink:0}}>{Object.keys(monthCycleStats).length} cycle{Object.keys(monthCycleStats).length!==1?"s":""} · {completeCycles} complete</span>
          </div>
          {!trackerCollapsed && (Object.entries(monthCycleStats).length===0?(
            <div style={{fontSize:10,color:"#CCC",fontStyle:"italic"}}>No posts placed yet.</div>
          ):Object.entries(monthCycleStats).map(([cyc,stats])=>{
            const complete = stats.total>=10;
            return(
              <div key={cyc} style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
                <span style={{fontSize:10,color:BRAND.drySage,minWidth:48,flexShrink:0}}>Cycle {cyc}</span>
                <div style={{flex:1,height:8,background:"#E8E6E1",borderRadius:4,overflow:"hidden",display:"flex",gap:1}}>
                  {CORE_PILLARS.map(pk=>{const p=PILLARS[pk];const cnt=stats[pk]||0;const target=CYCLE_TARGET[pk];return Array.from({length:cnt}).map((_,i)=>(<div key={`${pk}-${i}`} style={{flex:1,maxWidth:`${100/10}%`,background:cnt>target&&i>=target?"#E83D3A":p.color,borderRadius:1}}/>));}).flat()}
                </div>
                <span style={{fontSize:10,minWidth:44,color:complete?"#27500A":BRAND.drySage,fontWeight:complete?600:400}}>{stats.total}/10{complete?" ✓":""}</span>
                <div style={{display:"flex",gap:3,flexShrink:0}}>
                  {CORE_PILLARS.map(pk=>{const p=PILLARS[pk];const cnt=stats[pk]||0;const t=CYCLE_TARGET[pk];const ok=cnt===t;const over=cnt>t;return(<span key={pk} style={{fontSize:9,padding:"1px 5px",borderRadius:8,background:over?"#FCEBEB":ok?p.bg:"#F0EFEC",color:over?"#A32D2D":ok?p.color:"#BBB",fontWeight:ok||over?600:400}}>{cnt}/{t}</span>);})}
                </div>
              </div>
            );
          }))}
        </div>

        <div style={{flex:1,overflowY:"auto",padding:"12px 18px"}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4,marginBottom:4}}>
            {DAY_NAMES_SHORT.map(d=>(<div key={d} style={{fontSize:10,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.08em",color:BRAND.drySage,textAlign:"center"}}>{d}</div>))}
          </div>
          {weeks.map((week,wi)=>(
            <div key={wi} style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4,marginBottom:4}}>
              {week.map((day,di)=>{
                if(!day) return <div key={di} style={{minHeight:76,background:"#F3F2EF",borderRadius:4,opacity:0.3}}/>;
                const today = new Date(); today.setHours(0,0,0,0);
                const isPast = day.date < today;
                const fadedOpacity = isPast ? 0.45 : 1;
                const isWeekend = day.date.getDay()===0||day.date.getDay()===6;
                const dayPosts = (placements[day.id]||[]).map(id=>getConcept(id,conceptDetails)).filter(Boolean);
                const corePosts = dayPosts.filter(c=>CORE_PILLARS.includes(c.pillar));
                const timelyPosts = dayPosts.filter(c=>c.pillar==="Timely");
                const isDrop = hoverDay===day.id;
                return(
                  <div key={day.id} onDragOver={e=>{onDragOver(e);setHoverDay(day.id);}} onDragLeave={()=>setHoverDay(null)} onDrop={e=>{onDropDay(e,day.id);setHoverDay(null);}}
                    style={{minHeight:110,background:isDrop?"#EFF6EC":isWeekend?"#F5F4F0":"#FFF",border:`1px solid ${isDrop?"#639922":BRAND.sand}`,borderRadius:4,padding:"5px 6px",transition:"all 0.08s"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
                      <span style={{fontSize:11,fontWeight:600,color:isWeekend?BRAND.sand:BRAND.paw,opacity:fadedOpacity}}>{day.date.getDate()}</span>
                      {corePosts.length>0&&<span style={{fontSize:9,color:BRAND.grass,fontWeight:600,opacity:fadedOpacity}}>{corePosts.length}p</span>}
                    </div>
                    {timelyPosts.map(concept=>{
                      const p=PILLARS.Timely;
                      const isMatch = matchesCalendarSearch(concept);
                      const evOpacity = calendarSearch && !isMatch ? 0.15 : fadedOpacity;
                      const matchKey = `${day.id}::${concept.id}`;
                      const isActive = calendarSearch && isMatch && matchKeyToIndex[matchKey] === activeMatchIndex;
                      const setRef = (el) => {
                        if (el) matchRefs.current.set(matchKey, el);
                        else matchRefs.current.delete(matchKey);
                      };
                      return(<div key={concept.id} ref={setRef} draggable onDragStart={e=>onDragStart(e,concept,day.id)} onClick={e=>{e.stopPropagation();openPanel(concept.id);}} style={{background:p.bg,borderLeft:`2px solid ${p.color}`,borderRadius:3,padding:"3px 5px",marginBottom:2,cursor:"grab",display:"flex",alignItems:"flex-start",gap:3,opacity:evOpacity,outline: isActive ? `3px solid ${BRAND.rust}` : (calendarSearch && isMatch ? `2px solid ${BRAND.paw}` : "none"),boxShadow: isActive ? `0 0 0 4px ${BRAND.rust}33` : "none",transition:"opacity 0.12s, box-shadow 0.12s, outline-color 0.12s",position:"relative",zIndex:isActive?2:"auto"}}>
                        <span style={{fontSize:11,flex:1,color:BRAND.paw,lineHeight:1.35}}>{concept.title}</span>
                        <button onClick={e=>{e.stopPropagation();remove(concept.id,day.id);}} style={{background:"none",border:"none",cursor:"pointer",fontSize:10,color:BRAND.sand,padding:0,flexShrink:0}}>×</button>
                      </div>);
                    })}
                    {dayPosts.filter(c=>c.pillar!=="Timely").map(concept=>{
                      const p=PILLARS[concept.pillar]||PILLARS.Brand;
                      const isMatch = matchesCalendarSearch(concept);
                      const evOpacity = calendarSearch && !isMatch ? 0.15 : fadedOpacity;
                      const matchKey = `${day.id}::${concept.id}`;
                      const isActive = calendarSearch && isMatch && matchKeyToIndex[matchKey] === activeMatchIndex;
                      const setRef = (el) => {
                        if (el) matchRefs.current.set(matchKey, el);
                        else matchRefs.current.delete(matchKey);
                      };
                      return(<div key={concept.id} ref={setRef} draggable onDragStart={e=>onDragStart(e,concept,day.id)} onClick={e=>{e.stopPropagation();openPanel(concept.id);}} style={{background:p.bg,borderLeft:`2px solid ${p.color}`,borderRadius:3,padding:"3px 5px",marginBottom:2,cursor:"grab",display:"flex",alignItems:"flex-start",gap:3,opacity:evOpacity,outline: isActive ? `3px solid ${BRAND.rust}` : (calendarSearch && isMatch ? `2px solid ${BRAND.paw}` : "none"),boxShadow: isActive ? `0 0 0 4px ${BRAND.rust}33` : "none",transition:"opacity 0.12s, box-shadow 0.12s, outline-color 0.12s",position:"relative",zIndex:isActive?2:"auto"}}>
                        <span style={{fontSize:11,flex:1,color:BRAND.paw,lineHeight:1.35}}>{concept.title}</span>
                        <button onClick={e=>{e.stopPropagation();remove(concept.id,day.id);}} style={{background:"none",border:"none",cursor:"pointer",fontSize:10,color:BRAND.sand,padding:0,flexShrink:0}}>×</button>
                      </div>);
                    })}
                    {dayPosts.length===0&&<div style={{fontSize:9,color:"#DDD",textAlign:"center",paddingTop:10,opacity:fadedOpacity}}>+</div>}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <ConceptPanel
        conceptId={selectedConceptId}
        draft={panelDraft}
        setDraft={setPanelDraft}
        onClose={closePanel}
        onSave={savePanel}
        saving={savingPanel}
        uploading={uploadingMedia}
        onUpload={handleUploadMedia}
        onRemoveMedia={handleRemoveMedia}
      />
    </div>
  );
}
