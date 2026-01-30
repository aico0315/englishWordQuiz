"use strict";

import { wordRecords } from './data.js';

const questionArea = document.querySelector(".question-area");
const counterArea = document.querySelector(".counter-area");
const setQuestion = document.querySelector(".set-question");
const inputAnswer = document.querySelector(".input-answer");
const judgementAnswerBtn = document.querySelector(".judgement-answer-btn");

const answerArea = document.querySelector(".answer-area");
const resultMessage = document.querySelector(".result-message");
const correctAnswer = document.querySelector(".correct-answer");
const supplementMessage = document.querySelector(".supplement-message");
const userAnswer = document.querySelector(".user-answer");
const nextQuestionBtn = document.querySelector(".next-question-btn");

const clearArea = document.querySelector(".clear-area");
const retryBtn = document.querySelector(".retry-btn");

const questionView = document.getElementById("question-view");
const answerView = document.getElementById("answer-view");
const clearView = document.getElementById("clear-view");



//シャッフルされた問題
const shuffledQuestions = [...wordRecords];

//現在の問題
let currentQuiz = null;

//現在のインデックス
let currentIndex = 0;

//現在の正誤結果
let judgeResult = null;

//カウンターナンバー
let counterNumber = "";

//クリア画面と解答画面を非表示
function clearAndAnswerAreaHidden (){
  clearArea.classList.add("hidden");
  answerArea.classList.add("hidden");
};

//問題画面を表示
function questionAreaRemove (){
  questionArea.classList.remove("hidden");
};

//問題画面と解答画面を表示・非表示
function questionAndAnswerHiddenToggle (){
  questionArea.classList.add("hidden");
  answerArea.classList.remove("hidden");
};

//全問回答(クリア)画面表示
function clearViewDisplay (){
  allViewHidden();
  clearArea.classList.remove("hidden");
}

//全エリア非表示
function allViewHidden (){
  questionArea.classList.add("hidden");
  answerArea.classList.add("hidden");
  clearArea.classList.add("hidden");
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

  sessionStorage.setItem('quizState', JSON.stringify(state));
}


//問題出題関数
function newSetQuestion (savedQuestionIndex){
  clearAndAnswerAreaHidden();
  questionAreaRemove();

  const questionIndex = savedQuestionIndex !== undefined? savedQuestionIndex : currentIndex;
  const newQuestionObject = shuffledQuestions[questionIndex];

  if(!newQuestionObject){
    console.error("問題が見つかりません。インデックス", questionIndex);
    return;  //強制終了
  }

  counterNumber = `${questionIndex +1} / ${shuffledQuestions.length}`;  //この +1 は、データとしてのindex(0開始)と、人間が見るための表示(1開始)を合わすためにindexに1を足している
  counterArea.textContent = counterNumber;

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


//イベント

shuffleQuestions();

//データ復元関数
document.addEventListener("DOMContentLoaded", ()=>{
    const stateData = sessionStorage.getItem('quizState');
      if(stateData !== null){
        const displayData = JSON.parse(stateData);

        shuffledQuestions.length = 0;
        shuffledQuestions.push(...displayData.shuffled);

        currentIndex = displayData.questionIndex;

        allViewHidden();

        const stateObject = document.getElementById(displayData.nowDisplay);
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
      }else{
        newSetQuestion();
      }
});

//PC向けのEnterキー判定
inputAnswer.addEventListener("keydown", (event)=> {
  if(event.isComposing){
    return;
  }

  if(event.key === "Enter"){
    answerAreaDisplay();
  }
});

//スマホ向け変換確定判定
inputAnswer.addEventListener("compositionend", (event)=> {
  answerAreaDisplay();
});

//答えbtnクリック
judgementAnswerBtn.addEventListener("click", ()=> {
  answerAreaDisplay();
});

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

//リトライBtnクリック
retryBtn.addEventListener("click", ()=> {
  currentIndex = 0;
  shuffleQuestions();
  newSetQuestion();
  saveData();
});

