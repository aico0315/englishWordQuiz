"use strict";

import images from './imagesData.js';


//画像表示エリア
const menuAreaImgArea = document.querySelector(".menuArea-img-area");
const questionAreaImgRight = document.querySelector(".questionArea-img-right");
const questionAreaImgLeft = document.querySelector(".questionArea-img-left");
const resultMessageIconLeft = document.querySelector(".result-message-icon-left");
const resultMessageIconRight = document.querySelector(".result-message-icon-right");
const clearImgArea = document.querySelector(".clear-img-area");

const body = document.querySelector("body");
const themeToggle = document.querySelector(".theme-toggle");
const webTitle = document.querySelector(".web-title");

// メニューエリア変数
const menuArea = document.querySelector(".menu-area");
const modalOverlay = document.getElementById("modal-overlay");
const modeSelectArea = document.querySelector(".mode-select-area");
const weakWordsBtn = document.querySelector(".weak-words-btn");
const closeBtn = document.querySelector(".close-btn");
const questionContinueBtn = document.querySelector(".question-continue-btn");
const questionNewStartBtn = document.querySelector(".question-newStart-btn");
const addNewQuestionBtn = document.querySelector(".add-newQuestion-btn");

// 出題・回答エリア
const questionArea = document.querySelector(".question-area");
const counterArea = document.querySelectorAll(".counter-area");
const setQuestion = document.querySelector(".set-question");
const answerForm = document.getElementById("answer-form");
const inputAnswer = document.querySelector(".input-answer");
const judgementAnswerBtn = document.querySelector(".judgement-answer-btn");

// 解答エリア
const answerArea = document.querySelector(".answer-area");
const resultMessage = document.querySelector(".result-message");
const correctAnswer = document.querySelector(".correct-answer");
const supplementMessage = document.querySelector(".supplement-message");
const userAnswer = document.querySelector(".user-answer");
const nextQuestionBtn = document.querySelector(".next-question-btn");

// 単語追加エリア
const addQuestionArea = document.querySelector(".add-question-area");
const inputCategory = document.querySelector(".input-category");
const inputEnglishWord = document.querySelector(".input-english-word");
const inputJapaneseWord = document.querySelector(".input-japanese-word");
const inputSupplementaryInformation = document.querySelector(".input-supplementary-information");
const cancelBtn = document.querySelector(".cancel-btn");
const addBtn = document.querySelector(".add-btn");

// 単語削除エリア
const editAreaWordList = document.getElementById("editArea-wordList");

// 全問回答エリア
const clearArea = document.querySelector(".clear-area");
const wrongWordBtn = document.querySelector(".wrong-word-btn");
const retryBtn = document.querySelector(".retry-btn");

// ホームボタン（メニューへ戻る）
const returnMenuBtn = document.querySelectorAll(".return-menu-btn");

//画像プレロード
const targetImages = [
  "image/subImage/talkingChildren@72x.webp",
  "image/subImage/correctBoy@72x.webp",
  "image/subImage/correctGirl@72x.webp",
  "image/subImage/notCorrectGirl@72x.webp",
  "image/subImage/notCorrectBoyBlue@72x.webp",
  "image/subImage/notCorrectBoyGreen@72x.webp",
  "image/subImage/deleteBtn@72x.webp",
  "image/subImage/editBtn@72x.webp",
];



//ユーザーが登録した単語
let userAddedRecords = [];

//シャッフルされた問題
let shuffledQuestions = [];

//現在の問題
let currentQuiz = null;

//現在のインデックス
let currentIndex = 0;

//現在の正誤結果
let judgeResult = null;

//カウンターナンバー
let counterNumber = "";

//編集中の単語
let underEditId = null;

let selectedCategory = null;

//ダークモード状態
let isDark = false


//問題エリアのみ表示
function displayOnlyQuestionArea (){
  questionArea.classList.remove("hidden");
  clearArea.classList.add("hidden");
  menuArea.classList.add("hidden");
  answerArea.classList.add("hidden");
  addQuestionArea.classList.add("hidden");
}

//問題画面と解答画面を表示・非表示
function questionAndAnswerHiddenToggle (){
  questionArea.classList.add("hidden");
  answerArea.classList.remove("hidden");
}

//メニュー画面のみ表示
function menuViewDisplay (){
  menuArea.classList.remove("hidden");
  questionArea.classList.add("hidden");
  answerArea.classList.add("hidden");
  clearArea.classList.add("hidden");
  addQuestionArea.classList.add("hidden");
}

//問題追加画面のみ表示
function displayOnlyAddQuestionArea (){
  addQuestionArea.classList.remove("hidden");
  questionArea.classList.add("hidden");
  answerArea.classList.add("hidden");
  clearArea.classList.add("hidden");
  menuArea.classList.add("hidden");

  userAddedRecords = getLocalStorageData();
  const uniqueCategories = [...new Set(userAddedRecords.map(word => word.category))].filter(cat => cat);
  const categoryList = document.getElementById("category-list");
  categoryList.innerHTML = "";

  //カテゴリー名をサジェストとして表示
  uniqueCategories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    categoryList.appendChild(option);
  });
  wordDelete();
}

//全問回答(クリア)画面表示
function clearViewDisplay (){
  allViewHidden();
  clearImgArea.innerHTML = images.happyBoysAndGirls;
  clearArea.classList.remove("hidden");
}

//全エリア非表示
function allViewHidden (){
  menuArea.classList.add("hidden");
  questionArea.classList.add("hidden");
  answerArea.classList.add("hidden");
  clearArea.classList.add("hidden");
  addQuestionArea.classList.add("hidden");
}

//単語追加Viewの入力エリアを全クリア
function wordInputAreaAllClear (){
  inputCategory.value = "";
  inputEnglishWord.value = "";
  inputJapaneseWord.value = "";
  inputSupplementaryInformation.value = "";
}

//カウンター表示
function counterNumberDisplay (num){
  const questionIndex = num !== undefined? num : currentIndex;
  counterNumber = `${questionIndex +1} / ${shuffledQuestions.length}`;
  counterArea.forEach(area =>{
    area.textContent = counterNumber;
  });
}

//問題エリアでどちらの画像を出すか
function whichDisplaySvg (){
  questionAreaImgRight.innerHTML = "";
  questionAreaImgLeft.innerHTML = "";

  if(currentIndex % 2 === 0){
    questionAreaImgRight.innerHTML = images.worryBoyBlue;
  }else{
    questionAreaImgLeft.innerHTML = images.worryGirlWaterBlue;
  }
}

//ダークモードか否か
function isDarkMode (){
  return body.classList.contains("dark-mode");
}

//次の問題が存在するか否か
const hasNextQuestion = ()=> {
  return currentIndex +1 < shuffledQuestions.length;
}

//入力データの有無
function isInputData (){
  const userInput = {
    category: inputCategory ? inputCategory.value : "",
    english: inputEnglishWord ? inputEnglishWord.value : "",
    japanese: inputJapaneseWord ? inputJapaneseWord.value.split(/[、,]/) : "",
    supplement: inputSupplementaryInformation ? inputSupplementaryInformation.value : "",
  }
  return userInput;
}

function preload(imgPaths){
  imgPaths.forEach((imgPath)=> {
    const preImg = new Image();
    preImg.src = imgPath;
  });
}

//問題をシャッフルする
function shuffleQuestions (){
  for(let i = shuffledQuestions.length -1; i > 0; i --){
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledQuestions[j], shuffledQuestions[i]] = [shuffledQuestions[i], shuffledQuestions[j]];
  }
  currentIndex = 0;
}

//正規化関数
function normalizeInput (inputValue){
  const result = inputValue.trim();
  return result;
}

//正誤判定関数
function correctnessCheck (userInput, currentAnswer){
  const normalizedUserInput = normalizeInput(userInput);
  const normalizedCurrentAnswer = currentAnswer.map(ans => normalizeInput(ans));

  return normalizedCurrentAnswer.includes(normalizedUserInput);
}

//データ保存関数
function saveData (){
  const currentAnswerValue = inputAnswer ? inputAnswer.value : "";

  const state = {
    shuffled: shuffledQuestions,
    questionIndex: currentIndex,
    nowDisplay: document.querySelector("main > div:not(.hidden)")?.id || "none",
    lastResult: judgeResult,
    userAnswer: currentAnswerValue,
  }

  localStorage.setItem('quizState', JSON.stringify(state));
}

//メンテナンス
function updateExistingDataWithIds() {
  // 1. 今保存されているデータを全部持ってくる
  const allWords = getLocalStorageData();
  let isUpdated = false;

  // 2. 1つずつチェックして、IDがなければ付ける
  const updatedList = allWords.map((word, index) => {
    if (!word.id) {
      // IDがなければ、現在の時間 + インデックス番号（重複防止）で発行
      word.id = String(Date.now()) + index;
      isUpdated = true;
    }
    return word;
  });

  // 3. もし1つでも更新があったら、保存し直す
  if (isUpdated) {
    localStorage.setItem('userWords', JSON.stringify(updatedList));
    console.log("既存データにIDを付与しました！");
  }
}


//単語追加処理
function addQuestionData (){
  if(!inputEnglishWord.value.trim()){
    alert("英単語を入力してください");
    return;
  }

  if(!inputJapaneseWord.value.trim()){
    alert("日本語を入力してください");
    return;
  }

  const userInput = isInputData();

  const userInputJapanese = userInput.japanese;
  const answerArray = userInputJapanese;

  const addQuestion = {
    id: String(Date.now()),
    category: userInput.category,
    question: userInput.english,
    answer: answerArray,
    supplement: userInput.supplement,
  }

  const currentList = getLocalStorageData();
  currentList.push(addQuestion);

  localStorage.setItem('userWords', JSON.stringify(currentList));

  wordInputAreaAllClear();

  alert("追加しました！メニューから「はじめから」を押すと反映されます。");
}

//編集後の単語登録
function wordRevised (){
  const userInput = isInputData();

  const userInputJapanese = userInput.japanese;
  const answerArray = userInputJapanese;

  const currentList = getLocalStorageData();
  const updateWord = currentList.map((word)=> {
    if(String(word.id) === String(underEditId)){
      return {
        id: word.id,
        category: userInput.category,
        question: userInput.english,
        answer: answerArray,
        supplement: userInput.supplement,
        wrongCount: word.wrongCount, // 苦手回数も消えないように引き継ぐ
      }
    }else{
      return word;
    }
  });

  localStorage.setItem('userWords', JSON.stringify(updateWord));
  underEditId = null;
  userAddedRecords = updateWord;
}

//登録された単語データを取得
function getLocalStorageData (){
  const savedUserWords = localStorage.getItem('userWords');
  return savedUserWords ? JSON.parse(savedUserWords) : [];
}

//登録単語の削除
function wordDelete (){
  editAreaWordList.innerHTML = "";

  const allWords = getLocalStorageData();
  const uniqueCategories = [...new Set(allWords.map(word => word.category || "未設定"))];
    //結果、["IT用語", "日常英会話", "", "", ....]という親のリストができる

  // 2. 「未設定」を一番下にするための並び替えルール
  uniqueCategories.sort((a, b) => {
    if (a === "未設定") return 1;  // aが未設定なら、bより後ろ(1)にする
    if (b === "未設定") return -1; // bが未設定なら、aを前(-1)にする
    return a.localeCompare(b, 'ja'); // それ以外は日本語の辞書順で並べる
  });

  const categoryMap = {};
  uniqueCategories.forEach(category => {
    categoryMap[category] = userAddedRecords.filter(word => (word.category || "未設定") === category);

    const categoryDetails = document.createElement("details");
    const categorySummary = document.createElement("summary");
    categorySummary.textContent = category;
    categoryDetails.appendChild(categorySummary);

    categoryMap[category].forEach(word => {
      const wordDetails = document.createElement("details");
      const wordSummary = document.createElement("summary");
      wordSummary.classList.add("word-summary");
      const wordSummaryQuestion = document.createElement("span");
      const wordSummaryAnswer = document.createElement("span");
      const wordSummaryMark = document.createElement("span");
      wordSummaryMark.classList.add("word-summary-mark");
      const wordFooter = document.createElement("div");
      wordFooter.classList.add("word-footer");

      const wordSupplement = document.createElement("p");
      const editBtn = document.createElement("button");
      editBtn.classList.add("edit-btn");
      editBtn.dataset.id = word.id;
      const deleteBtn = document.createElement("button");
      deleteBtn.classList.add("delete-btn");
      deleteBtn.dataset.id = word.id;

      wordSummaryQuestion.textContent = `${word.question}`;
      wordSummaryAnswer.textContent = `/ ${word.answer[0]}`;
      wordSummaryMark.textContent = `︙`;
      wordSummary.appendChild(wordSummaryQuestion);
      wordSummary.appendChild(wordSummaryAnswer);
      wordSummary.appendChild(wordSummaryMark);

      wordSupplement.textContent = `${word.supplement}`;
      editBtn.innerHTML = `<button><img class="edit-btn-img" src="image/subImage/editBtn@72x.webp"></button>`;
      deleteBtn.innerHTML = `<img class="delete-btn-img" src="image/subImage/deleteBtn@72x.webp">`;

      wordDetails.appendChild(wordSummary);
      wordFooter.appendChild(wordSupplement);
      wordFooter.appendChild(editBtn);
      wordFooter.appendChild(deleteBtn);
      wordDetails.appendChild(wordFooter);

      categoryDetails.appendChild(wordDetails);
  });

  editAreaWordList.appendChild(categoryDetails);
});

  const editBtn = document.querySelectorAll(".edit-btn");
  const deleteBtn = document.querySelectorAll(".delete-btn");

  //単語編集ボタン実行
  editBtn.forEach((btn)=> {
    btn.addEventListener("click", ()=>{
      const clickedId = btn.dataset.id;
      underEditId = clickedId;

      const targetWord = allWords.find(word => String(word.id) === String(clickedId));

      if(targetWord){
        inputCategory.value = targetWord.category ? targetWord.category : "";
        inputEnglishWord.value = targetWord.question ? targetWord.question : "";
        inputJapaneseWord.value = targetWord.answer ? targetWord.answer : "";
        inputSupplementaryInformation.value = targetWord.supplement ? targetWord.supplement : "";
      }

      // console.log("比較する相手のID:", clickedId);
      // console.log("名簿のID:", userAddedRecords[0].id); // 1つ目のデータを確認
      // console.log("現在選択された単語は", targetWord.question);

      const buttonLabel = underEditId === null ? "登録" : "更新";
      addBtn.textContent = buttonLabel;
      addQuestionArea.scrollIntoView({behavior: "smooth"});
    })
  });

  //キャンセルbtn実行
  cancelBtn.addEventListener("click", ()=>{
    editAreaWordList.scrollIntoView({behavior: "smooth"});
    inputCategory.value = "";
    inputEnglishWord.value = "";
    inputJapaneseWord.value = "";
    inputSupplementaryInformation.value = "";
    addBtn.textContent = "登録";
  });

  //単語の削除ボタン実行
  deleteBtn.forEach((btn)=> {
    btn.addEventListener("click", ()=> {
      const clickedId = btn.dataset.id;
      const targetWord = allWords.find(word => String(word.id) === String(clickedId));

      const isDelete = confirm(`本当に${targetWord.question}を削除しますか？`);
      if(!isDelete){
        return;
      }else{
        const editedWordsList = userAddedRecords.filter((word, i)=> i !== clickedId);
        alert("削除しました");
        userAddedRecords = editedWordsList;
        localStorage.setItem("userWords", JSON.stringify(userAddedRecords));
        wordDelete();
      }
    });
  });
}


//問題出題関数
function newSetQuestion (savedQuestionIndex){
  displayOnlyQuestionArea();

  const questionIndex = savedQuestionIndex !== undefined? savedQuestionIndex : currentIndex;
  const newQuestionObject = shuffledQuestions[questionIndex];

  if(!newQuestionObject){
    console.error("問題が見つかりません。インデックス", questionIndex);
    return;  //強制終了
  }

  counterNumberDisplay(currentIndex);

  inputAnswer.value = '';

  currentQuiz = newQuestionObject;
  console.log(shuffledQuestions[questionIndex]);

  const getQuestion = shuffledQuestions[questionIndex].question;
  setQuestion.textContent = getQuestion;

  whichDisplaySvg();
}


//answerArea表示
function answerAreaDisplay (savedIndex, savedResult, savedUserAnswer){
  const inputValue = savedUserAnswer !== undefined? savedUserAnswer : inputAnswer.value;
  const questionResult = savedResult !== undefined? savedResult : correctnessCheck(inputValue, currentQuiz.answer);

  counterNumberDisplay();
  judgeResult = questionResult;

  resultMessage.classList.remove("true-style");
  resultMessage.classList.remove("false-style");

  if(questionResult){
    resultMessage.textContent = "正解!";
    resultMessageIconLeft.innerHTML = `<img src="image/subImage/correctGirl@72x.webp">`;
    resultMessageIconRight.innerHTML = `<img src="image/subImage/correctBoy@72x.webp">`;
    resultMessage.classList.add("true-style");
  }else{
    resultMessage.textContent = "残念!";
    resultMessageIconLeft.innerHTML = `<img src="image/subImage/notCorrectBoyBlue@72x.webp">`;
    resultMessageIconRight.innerHTML = `<img src="image/subImage/notCorrectGirl@72x.webp">`;
    resultMessage.classList.add("false-style");

    const currentList = getLocalStorageData();
    const targetWord = currentList.find(word => word.question === currentQuiz.question);

    if(targetWord){
      targetWord.wrongCount = (targetWord.wrongCount || 0) +1;
      localStorage.setItem("userWords", JSON.stringify(currentList));
    }
    console.log("現在のwrongCountは", targetWord.wrongCount);
  }

  questionAndAnswerHiddenToggle();

  if(savedIndex === undefined){
    saveData();
  }

  correctAnswer.textContent = currentQuiz.answer[0];

  const supplementMessageValue = currentQuiz.supplement;
  if(supplementMessageValue){
    supplementMessage.textContent = supplementMessageValue;
  }else{
    supplementMessage.textContent = "";
  }
  userAnswer.textContent = inputValue;
}

//復元処理
function loadQuiz (){
  const userWords = getLocalStorageData();
  if(userWords.length === 0){
    alert("単語追加画面から単語を登録してね");
    return;
  }

  const stateData = localStorage.getItem('quizState');
  if(!stateData){
    console.alert("データがありません はじめからスタートしてね");
    return;
  }

  const displayData = JSON.parse(stateData);

  shuffledQuestions.length = 0;
  shuffledQuestions.push(...displayData.shuffled);

  currentIndex = displayData.questionIndex;

  allViewHidden();

  if(displayData.nowDisplay === "question-view"){
    newSetQuestion(displayData.questionIndex)
  }else if(displayData.nowDisplay === "answer-view"){
    currentQuiz = shuffledQuestions[displayData.questionIndex];
    answerAreaDisplay(displayData.questionIndex, displayData.lastResult, displayData.userAnswer)
  }else if(displayData.nowDisplay === "clear-view"){
    currentIndex = 0;
    clearViewDisplay();
  }else{
    newSetQuestion();
  }
}

//カテゴリーボタン生成
function generateCategoryBtns(){
  const container = document.getElementById("category-btns-container");
  container.innerHTML = "";

  const allWords = getLocalStorageData();
  const uniqueCategories = [...new Set(allWords.map(word => word.category ? word.category : "未設定"))]
    .sort((a, b) => {
      if (a === "未設定") return 1;  // aが未設定なら、bより後ろ(1)にする
      if (b === "未設定") return -1; // bが未設定なら、aを前(-1)にする
      return a.localeCompare(b, 'ja'); // それ以外は日本語の辞書順で並べる;
    });

  uniqueCategories.forEach(category => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "category-btn";
    btn.textContent = category; //uniqueCategories配列の中のユーザーが登録したカテゴリー名
    btn.dataset.category = category;

    container.appendChild(btn);
  });
}

//実際にボタンを押した時の表示
function displayCategoryBtn(){
  const currentList = getLocalStorageData();
  const categoryBtn = document.querySelectorAll(".category-btn");

  categoryBtn.forEach((btn)=> {
    btn.addEventListener("click", ()=> {
      const clickedCategory = btn.dataset.category;
      const targetWords = currentList.filter(word => {
        if(clickedCategory === "未設定"){
          return word.category === "" || !word.category;
        }else {
          return word.category === clickedCategory;
        }
      });

      shuffledQuestions = targetWords;
      shuffleQuestions();
      newSetQuestion();
    })
  });
}

//イベント

shuffleQuestions();
preload(targetImages);

//ロード後
document.addEventListener("DOMContentLoaded", ()=>{
  updateExistingDataWithIds();
  menuAreaImgArea.innerHTML = `<img src="image/subImage/talkingChildren@72x.webp">`
  allViewHidden();

  const modeResult = localStorage.getItem("isDarkMode");
  const displayMode = JSON.parse(modeResult);
  if(displayMode){
    body.classList.add("dark-mode");
  }
  menuViewDisplay();
});

// ==== dark-mode ====
themeToggle.addEventListener("click", () => {
  isDark = !isDark;
  themeToggle.classList.toggle("darkMode");
  document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
  localStorage.setItem("theme", isDark ? "dark" : "light");
});

// == menu-area ==

//はじめるbtn
questionNewStartBtn.addEventListener("click", () => {
  const userWords = getLocalStorageData();

  if(userWords.length === 0){
    alert("単語追加画面から単語を登録してね");
    return;
  }

  generateCategoryBtns();
  displayCategoryBtn();

  modalOverlay.classList.remove("hidden"); // ① まずoverylayを表示

  setTimeout(() => {
    modeSelectArea.classList.add("active"); // ② 少し遅らせてアニメーション開始
  }, 10);
});



//保存データからのスタート
questionContinueBtn.addEventListener("click", ()=> {
  loadQuiz();
});

//苦手な単語データ
weakWordsBtn.addEventListener("click", ()=> {
  const currentList = getLocalStorageData();
  const targetWords = currentList.filter(word => word.wrongCount > 0);
  shuffledQuestions = targetWords;

  shuffleQuestions();
  newSetQuestion();
  saveData();
});



//閉じるボタン
closeBtn.addEventListener("click", ()=>{
  modeSelectArea.classList.remove("active");
  modalOverlay.classList.add("hidden");
});

//単語追加ページへの遷移
addNewQuestionBtn.addEventListener("click", ()=> {
  allViewHidden();
  displayOnlyAddQuestionArea();
  // openAccordion();
});

// == wordsAddAndDelete-area ==

//単語追加処理を実行
addBtn.addEventListener("click", ()=> {
  if(underEditId === null){
    addQuestionData();
    userAddedRecords = getLocalStorageData();
    wordDelete();
  }else {
    wordRevised();
    underEditId = null;
    wordInputAreaAllClear();
    alert("更新されました");
    addBtn.textContent = "登録";
    userAddedRecords = getLocalStorageData();
    wordDelete();
  }
});



// == question-area ==

//回答入力Enterキー判定
answerForm.addEventListener("submit", (event)=> {
  event.preventDefault();
  answerAreaDisplay();
});

//答えbtnクリック
judgementAnswerBtn.addEventListener("click", ()=> {
  answerAreaDisplay();
});

// == answer-area ==

//次の問題Btnクリック
nextQuestionBtn.addEventListener("click", ()=> {
  if(!hasNextQuestion()){
    clearViewDisplay();
    saveData();
    return;  //ガード句 : ここで処理を強制終了させる処理
  }
  currentIndex ++;  //nextQuestionBtnをクリックするたびにcurrentIndexを1ずつ増やすことで、問題が一つずつ先へ進む
  newSetQuestion();
  saveData();
});

// == clear-area ==

//リトライBtnクリック
retryBtn.addEventListener("click", ()=> {
  currentIndex = 0;
  shuffleQuestions();
  newSetQuestion();
  saveData();
});

//苦手単語へ挑戦btn
wrongWordBtn.addEventListener("click", ()=>{
  const allWords = getLocalStorageData();
  const weakWords = allWords.filter(word => word.wrongCount > 0) || "まだ苦手な単語はありません";
  shuffledQuestions = weakWords;

  shuffleQuestions();
  newSetQuestion();
});

//サイトロゴ押下でメニュー画面遷移
webTitle.addEventListener("click", ()=> {
  allViewHidden();
  menuViewDisplay();
});

//メニュー画面へ遷移
returnMenuBtn.forEach((btn) => {
  btn.addEventListener("click", ()=> {
  allViewHidden();
  menuViewDisplay();
  });
});
