function std_addition() {
  var all_cards = []
  for (var i = 1; i < 10; i++) {
    for (var j = 0; j < 10; j++) {
      var card = i.toString() + " + " + j.toString() + " = _";
      var answer = i + j;
      all_cards.push([card, answer]);
    }
  }
  return all_cards;
}

function d2pd1_addition() {
  var all_cards = []
  for (var i = 0; i < 100; i++) {
    for (var j = 0; j < 10; j++) {
      var card = i.toString() + " + " + j.toString() + " = _";
      var answer = i + j;
      all_cards.push([card, answer]);
    }
  }
  return all_cards;
}

function std_subtraction() {
  var all_cards = []
  for (var i = 1; i < 10; i++) {
    for (var j = 0; j < 10; j++) {
      var answer = i + j
      var card = answer.toString() + " - " + i.toString() + " = _";
      answer = j;
      all_cards.push([card, answer]);
    }
  }
  return all_cards;
}

function simple_subtraction() {
  var all_cards = []
  for (var i = 1; i <= 10; i++) {
    for (var j = i; j >= 0; j--) {
      var card = i.toString() + " - " + j.toString() + " = _";
      var answer = i - j;
      all_cards.push([card, answer]);
    }
  }
  return all_cards;
}

function std_multiplication() {
  var all_cards = []
  for (var i = 0; i < 10; i++) {
    for (var j = 0; j < 10; j++) {
      var card = i.toString() + " * " + j.toString() + " = _";
      var answer = i * j;
      all_cards.push([card, answer]);
    }
  }
  return all_cards;
}

function std_division() {
  var all_cards = []
  for (var i = 1; i < 10; i++) {
    for (var j = 0; j < 10; j++) {
      var answer = i * j;
      var card = answer.toString() + " / " + i.toString() + " = _";
      answer = j;
      all_cards.push([card, answer]);
    }
  }
  return all_cards;
}

// Configuration
var mode = std_subtraction;//std_multiplication;//*/d2pd1_addition;
var num_cards = 25;
var secs = num_cards * 5;
var timeout = false;//true;

// State
var cards = [];  // each is a tuple ["card", answer]
var state = 'idle';  // idle -> test -> done
var start_time = null;
var end_time = null;
var curr_card = null;
var answer = '';
var passed = 0;
var failed = 0;
var fail_log = [];

// https://stackoverflow.com/a/29816921/2116585
function msToHrMinSec(ms) {
  var seconds = ms / 1000;
  var secondsR = Math.round(seconds * 100) / 100
  var hours = parseInt(seconds / 3600);
  seconds = seconds % 3600;
  var minutes = parseInt(seconds / 60);
  seconds = seconds % 60;
  if (hours > 0) {
    return hours + "h:" + minutes + "m:" + secondsR + "s";
  } else if (minutes > 0) {
    return minutes + "m:" + secondsR + "s";
  } else {
    return secondsR + "s";
  }
}

// Returns a random selection of `num cards within `all_cards. Repeats will only
// occur as needed when `num is greater than `all_cards.length.
function get_random_cards(all_cards, num) {
  var rnd_cards = [];
  var set_cards = [];
  while (rnd_cards.length < num) {
    if (set_cards.length == 0) {
      set_cards = [...all_cards];
    }
    var rnd_idx = Math.floor(Math.random() * set_cards.length);
    rnd_cards.push(set_cards[rnd_idx]);
    set_cards.splice(rnd_idx, 1)
  }
  return rnd_cards;
}

function init() {
  var all_cards = mode();

  // Verifies all cards are properly formatted
  var error = false;
  all_cards.forEach(card => {
    if (card.length != 2) {
      console.log(card + ": is NOT length 2");
      error = true;
    }
    if (!card[0].includes("_")) {
      console.log(card[0] + ": does NOT include a '_'");
      error = true;
    }
  })
  if (error) {
    set_card_text("ERROR")
    return;
  }

  cards = get_random_cards(all_cards, num_cards)
  console.log("Created " + cards.length.toString() + " cards");
}

function event_code_numeric_value(code) {
  if (code == 'Numpad0' || code == 'Digit0') {
    return '0';
  } else if (code == 'Numpad1' || code == 'Digit1') {
    return '1';
  } else if (code == 'Numpad2' || code == 'Digit2') {
    return '2';
  } else if (code == 'Numpad3' || code == 'Digit3') {
    return '3';
  } else if (code == 'Numpad4' || code == 'Digit4') {
    return '4';
  } else if (code == 'Numpad5' || code == 'Digit5') {
    return '5';
  } else if (code == 'Numpad6' || code == 'Digit6') {
    return '6';
  } else if (code == 'Numpad7' || code == 'Digit7') {
    return '7';
  } else if (code == 'Numpad8' || code == 'Digit8') {
    return '8';
  } else if (code == 'Numpad9' || code == 'Digit9') {
    return '9';
  } else {
    console.log(code)
    return null;
  }
}

function key_event(event) {
  if (state == 'idle') {
    // Space key starts the test
    if (event.code == "Space") {
      next_card();
      state = 'test';
      start_time = Date.now();
      if (timeout) {
        console.log(secs * 1000)
        setTimeout(timeout_event, secs * 1000);
      }
    }
  } else if (state == 'test') {
    // Numeric values gather, Backspace/Delete clears, Enter completes
    if (event.code == 'Enter' || event.code == 'NumpadEnter') {
      console.log('Answer: ' + answer);
      if (parseInt(answer) == curr_card[1]) {
        passed += 1;
      } else {
        failed += 1;
        fail_log.push([curr_card[0], curr_card[1], answer]);
      }
      if (passed + failed == num_cards) {
        end_time = Date.now();
        state = 'done';
        finish();
      } else {
        next_card();
      }
      answer = '';
    } else if (event.code == 'Backspace') {
      if (answer.length > 0) {
        answer = answer.slice(0, -1)
      }
      console.log('answer: ' + answer);
      set_card_with_answer(curr_card[0], answer)
    } else if (event.code == 'Delete') {
      answer = '';
      console.log('answer: ' + answer);
      set_card_with_answer(curr_card[0], answer)
    } else {
      var number = event_code_numeric_value(event.code);
      if (number != null) {
        answer += number;
        console.log('answer: ' + answer);
        set_card_with_answer(curr_card[0], answer)
      }
    }
  } else if (state == 'done') {
    // do nothing
  } else {
    console.log("ERROR: unknown FSM state " + state);
  }
}

function timeout_event() {
  if (state == 'test') {
    end_time = Date.now();
    state = 'done';
    finish();
  }
}

function next_card() {
  if (cards.length == 0) {
    console.log("ERROR: ran out of cards, WTF?");
  }
  curr_card = cards[0];
  cards.splice(0, 1);
  set_card_text(curr_card[0]);
}

function set_card_with_answer(card_text, answer) {
  if (answer != "") {
    card_text = card_text.replace("_", answer)
  }
  set_card_text(card_text)
}

function set_card_text(text) {
  document.getElementById("flashcard").innerHTML = text;
}

function percent(a, b, digits) {
  return (parseFloat(a) / (b) * 100).toFixed(digits) + "%";
}

function finish() {
  var html = "";
  html += "<p>";
  html += "Completed: " + percent(passed + failed, num_cards, 0);
  html += "<br>";
  html += "Accuracy: " + percent(passed, passed + failed, 0);
  html += "<br>";
  html += "Score: " + percent(passed, num_cards, 0);
  html += "<br>";
  var total_time = end_time - start_time;
  html += "Total Time: " + msToHrMinSec(total_time);
  html += "<br>";
  var per_time = total_time / num_cards;
  html += "Card Time: " + msToHrMinSec(per_time);
  html += "</p>";
  document.getElementById("flashcard").innerHTML = html;
  document.getElementById("flashcard").style.fontSize = "150px";

  console.log("Failed:");
  fail_log.forEach(f => {
    console.log(f[0] + " exp=" + f[1] + " act=" + f[2]);
  });
}
