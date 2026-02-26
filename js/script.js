"use strict";

// import { wordRecords } from './data.js';

// メニューエリア変数
const menuArea = document.querySelector(".menu-area");
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
const inputEnglishWord = document.querySelector(".input-english-word");
const inputJapaneseWord = document.querySelector(".input-japanese-word");
const inputSupplementaryInformation = document.querySelector(".input-supplementary-information");
const addBtn = document.querySelector(".add-btn");

// 単語削除エリア
const deleteAreaWordList = document.getElementById("deleteArea-wordList");

// 全問回答エリア
const clearArea = document.querySelector(".clear-area");
const retryBtn = document.querySelector(".retry-btn");

// ホームボタン（メニューへ戻る）
const returnMenuBtn = document.querySelectorAll(".return-menu-btn");


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
let underEditIndex = null;


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
  wordDelete();
}

//全問回答(クリア)画面表示
function clearViewDisplay (){
  allViewHidden();
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

//入力エリアをクリア
function wordInputAreaAllClear (){
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

//次の問題が存在するか否か
const hasNextQuestion = ()=> {
  return currentIndex +1 < shuffledQuestions.length;
}

//入力データの有無
function isInputData (){
  const userInput = {
    english: inputEnglishWord ? inputEnglishWord.value : "",
    japanese: inputJapaneseWord ? inputJapaneseWord.value : "",
    supplement: inputSupplementaryInformation ? inputSupplementaryInformation.value : "",
  }
  return userInput;
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


//単語追加処理
function addQuestionData (){
  const userInput = isInputData();

  const userInputJapanese = userInput.japanese;
  const answerArray = userInputJapanese.split("、");

  const addQuestion = {
    question: userInput.english,
    answer: [answerArray],
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
  const answerArray = userInputJapanese.split("、");

  const currentList = getLocalStorageData();
  const updateWord = currentList.map((word, i)=> {
    if(i === underEditIndex){
      return {
        question: userInput.english,
        answer: [answerArray],
        supplement: userInput.supplement,
      }
    }else{
      return word;
    }
  });

  localStorage.setItem('userWords', JSON.stringify(updateWord));
  underEditIndex = null;
  userAddedRecords = updateWord;
}

//登録された単語データを取得
function getLocalStorageData (){
  const savedUserWords = localStorage.getItem('userWords');
  return savedUserWords ? JSON.parse(savedUserWords) : [];
}

//登録単語の削除
function wordDelete (){
  deleteAreaWordList.innerHTML = "";

  for(let i = 0; i < userAddedRecords.length; i++){
    const deleteItem = `<p class="word-item">${[i +1]}.${userAddedRecords[i].question}：${userAddedRecords[i].answer[0]}：<button class="edit-btn" data-index=${i}>編集</button>：<button class="delete-btn" data-index=${i}>削除</button></p>`;
    deleteAreaWordList.innerHTML += deleteItem;
  }

  const editBtn = document.querySelectorAll(".edit-btn");
  const deleteBtn = document.querySelectorAll(".delete-btn");

  //単語編集ボタン実行
  editBtn.forEach((btn)=> {
    btn.addEventListener("click", ()=>{
      const clickedIndex = Number(btn.dataset.index);
      underEditIndex = clickedIndex;
      inputEnglishWord.value = userAddedRecords[clickedIndex].question ? userAddedRecords[clickedIndex].question : "";
      inputJapaneseWord.value = userAddedRecords[clickedIndex].answer ? userAddedRecords[clickedIndex].answer : "";
      inputSupplementaryInformation.value = userAddedRecords[clickedIndex].supplement ? userAddedRecords[clickedIndex].supplement : "";

      const buttonLabel = underEditIndex === null ? "登録" : "更新";
      addBtn.textContent = buttonLabel;
    })
  })

  //単語の削除ボタン実行
  deleteBtn.forEach((btn)=> {
    btn.addEventListener("click", ()=> {
      const clickedIndex = btn.dataset.index;
      const deletedWordsList = userAddedRecords.filter((word, i)=> i !== Number(clickedIndex));
      alert("削除しました");

      userAddedRecords = deletedWordsList;
      localStorage.setItem("userWords", JSON.stringify(userAddedRecords));
      wordDelete();
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
    resultMessage.textContent = "正解です!";
    resultMessage.classList.add("true-style");
  }else{
    resultMessage.textContent = "残念!";
    resultMessage.classList.add("false-style");
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


//イベント

shuffleQuestions();

//ロード後
document.addEventListener("DOMContentLoaded", ()=>{
  allViewHidden();
  menuViewDisplay();
});

// == menu-area ==

//保存データからのスタート
questionContinueBtn.addEventListener("click", ()=> {
  loadQuiz();
});

//はじめからスタート
questionNewStartBtn.addEventListener("click", ()=> {
  currentIndex = 0;
  const userWords = getLocalStorageData();
  userAddedRecords = userWords;
  shuffledQuestions = userWords;

  shuffleQuestions();
  newSetQuestion();
  saveData();
});

//単語追加ページへの遷移
addNewQuestionBtn.addEventListener("click", ()=> {
  allViewHidden();
  displayOnlyAddQuestionArea();
});

// == wordsAddAndDelete-area ==

//単語追加処理を実行
addBtn.addEventListener("click", ()=> {
  if(underEditIndex === null){
    addQuestionData();
    userAddedRecords = getLocalStorageData();
    wordDelete();
  }else {
    wordRevised();
    underEditIndex = null;
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

returnMenuBtn.forEach((btn) => {
  btn.addEventListener("click", ()=> {
  console.log("ボタンが押されました");
  allViewHidden();
  menuViewDisplay();
  });
});