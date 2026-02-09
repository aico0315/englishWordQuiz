"use strict";

import { wordRecords } from './data.js';

const menuArea = document.querySelector(".menu-area");
const questionContinueBtn = document.querySelector(".question-continue-btn");
const questionNewStartBtn = document.querySelector(".question-newStart-btn");
const addNewQuestionBtn = document.querySelector(".add-newQuestion-btn");

const questionArea = document.querySelector(".question-area");
const counterArea = document.querySelectorAll(".counter-area");
const setQuestion = document.querySelector(".set-question");
const answerForm = document.getElementById("answer-form");
const inputAnswer = document.querySelector(".input-answer");
const judgementAnswerBtn = document.querySelector(".judgement-answer-btn");

const answerArea = document.querySelector(".answer-area");
const resultMessage = document.querySelector(".result-message");
const correctAnswer = document.querySelector(".correct-answer");
const supplementMessage = document.querySelector(".supplement-message");
const userAnswer = document.querySelector(".user-answer");
const nextQuestionBtn = document.querySelector(".next-question-btn");

const addQuestionArea = document.querySelector(".add-question-area");
const inputEnglishWord = document.querySelector(".input-english-word");
const inputJapaneseWord = document.querySelector(".input-japanese-word");
const inputSupplementaryInformation = document.querySelector(".input-supplementary-information");
const addBtn = document.querySelector(".add-btn");

const clearArea = document.querySelector(".clear-area");
const retryBtn = document.querySelector(".retry-btn");


const questionView = document.getElementById("question-view");
const answerView = document.getElementById("answer-view");
const clearView = document.getElementById("clear-view");
const addQuestionView = document.getElementById("add-question-view");
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

//問題追加処理
function addQuestionData (){
  const userInputEnglish = inputEnglishWord ? inputEnglishWord.value : "";
  const userInputJapanese = inputJapaneseWord ? inputJapaneseWord.value : "";

  const addQuestion = {
    question: userInputEnglish,
    answer: [userInputJapanese],
  }

  const currentList = getLocalStorageData();
  currentList.push(addQuestion);

  localStorage.setItem('userWords', JSON.stringify(currentList));

  inputEnglishWord.value = "";
  inputJapaneseWord.value = "";
  alert("追加しました！メニューから「はじめから」を押すと反映されます。");
}

//登録された単語データを取得
function getLocalStorageData (){
  const savedUserWords = localStorage.getItem('userWords');
  return savedUserWords ? JSON.parse(savedUserWords) : [];
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
  // counterNumber = `${questionIndex +1} / ${shuffledQuestions.length}`;  //この +1 は、データとしてのindex(0開始)と、人間が見るための表示(1開始)を合わすためにindexに1を足している
  // counterArea.textContent = counterNumber;

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
  shuffledQuestions = [...wordRecords, ...userWords];

  shuffleQuestions();
  newSetQuestion();
  saveData();
});

//単語追加ページへの遷移
addNewQuestionBtn.addEventListener("click", ()=> {
  allViewHidden();
  displayOnlyAddQuestionArea();
});

//単語追加処理を実行
addBtn.addEventListener("click", ()=> {
  addQuestionData();
})

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