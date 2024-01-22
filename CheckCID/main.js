'use strict';


const storage = localStorage;
// 基本要素
const table = document.querySelector('table');
const todo = document.getElementById('todo');
const priority = document.querySelector('select');
const deadline = document.querySelector('#deadline');
const submit = document.getElementById('submit');
// 絞り込み用
const filterday = document.querySelector('#filterday');
const filterpriority = document.querySelector('#filterpriority');
const filterclear = document.querySelector('#filterclear');
// 絞り込みのホップアップ表示用
const clickBtn = document.getElementById('click-btn');
const popupWrapper = document.getElementById('popup-wrapper');
const close = document.getElementById('close');
//　通知を飛ばす間隔設定用
let Minutes;

// listの中にtodoをitemオブジェクトとして保管
let list = [];

// ロードされた時にjsonファイルをlistに読み込む
document.addEventListener('DOMContentLoaded', () => {
  const json = storage.todoList;
  if (json == undefined) {
    return;
  }
  list = JSON.parse(json);
  for (const item of list) {
    addItem(item);
  }
});
// テーブルにtodoの要素を追加
const addItem = (item) => {
  const tr = document.createElement('tr');

  for (const prop in item) {
    const td = document.createElement('td');
    if (prop == 'done') {
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = item[prop];
      td.appendChild(checkbox);
      checkbox.addEventListener('change', checkBoxListener);
    } else {
      td.textContent = item[prop];
    }
    tr.appendChild(td);
  }

  table.append(tr);
};
// チェックボックスの状態を管理
const checkBoxListener = (ev) => {
  const trList = Array.from(document.getElementsByTagName('tr'));
  const currentTr = ev.currentTarget.parentElement.parentElement;
  const idx = trList.indexOf(currentTr) - 1;
  list[idx].done = ev.currentTarget.checked;
  storage.todoList = JSON.stringify(list);
};

// 提出ボタンを押した際にtodo要素の整形する
submit.addEventListener('click', () => {
  const item = {};
  // テーブルが崩れるのを防ぐための文字数制限
  if (todo.value != '') {
    if (todo.value.length > 12) {
      item.todo = todo.value.substring(0, 12);
    } else {
      item.todo = todo.value;
    }
  } else {
    item.todo = '未入力';
  }
  // 日付を指定しなかった際に０埋めされない為
  if (deadline.value != '') {
    item.deadline = deadline.value;
  } else {
    const date = new Date();
    let month = (date.getMonth() + 1).toString().padStart(2, '0');
    let day = date.getDate().toString().padStart(2, '0');
    item.deadline = `${date.getFullYear()}-${month}-${day}`;
  }
  item.priority = priority.value;
  item.done = false;
  addItem(item);
  list.push(item);
  // listの中身を日付でソートして画面を更新
  list.sort((a, b) => {
    return new Date(a.deadline) - new Date(b.deadline);
  });
  storage.todoList = JSON.stringify(list);

  location.reload();
});

// テーブルを消す
const clearTable = () => {
  const trList = Array.from(document.getElementsByTagName('tr'));
  trList.shift();
  for (const tr of trList) {
    tr.remove();
  }
};


// 削除ボタンを作成
const removeBtn = document.createElement('button');
removeBtn.textContent = '完了したTODOを削除する';
removeBtn.id = 'remove';
const main = document.querySelector('main');
main.appendChild(removeBtn);
// チェックボックスにチェックが入っているtodoを削除する
removeBtn.addEventListener('click', () => {
  clearTable();
  list = list.filter((item) => item.done == false);
  for (const item of list) {
    addItem(item);
  }
  storage.todoList = JSON.stringify(list);
});


// 指定した日付以前のtodoに絞り込みする
filterday.addEventListener('change', () => {
  clearTable();
  const filterDate = new Date(filterday.value);
  for (const item of list) {
    const itemDate = new Date(item.deadline);
    if (itemDate.getTime() <= filterDate.getTime()) {
      addItem(item);
    }
  }
});
//通知をする際に予定日が前日のものがあった時にサイトをロードした時と（設定）分ごとに通知を飛ばす
window.onload = function () {
  for (const item of list) {
    const itemDateNotice = new Date(item.deadline);
    const tomorrow = new Date();
    var day1 = tomorrow.getDate() + 1;
    var day2 = itemDateNotice.getDate();


    if (day2 == day1) {
      Push.create('明日が期限の予定がございます');

    }
  }
  Notification.requestPermission();
  setInterval(notices, 60000);
};
function notices() {

  for (const item of list) {
    const itemDateNotice = new Date(item.deadline);
    const tomorrow = new Date();
    var Tomorrow = tomorrow.getDate() + 1;
    var DeadLine = itemDateNotice.getDate();


    if (DeadLine == Tomorrow) {


      const currentTime = new Date();
      const minutes = currentTime.getMinutes();
      if (Minutes !== minutes && minutes % 15 === 0) {
        Minutes = minutes;
        Push.create('期限の近い予定がございます');
        break;
      }

    }

  }
};

// 優先度絞り込み
// listに入っている順番とitemとしてテーブルに掲載している順番にずれが生じている
// 例えば絞り込みをしたときに一番上に来た情報を削除すると絞り込み前の一番上の情報が削除されている
filterpriority.addEventListener('change', () => {
  clearTable();
  for (const item of list) {
    if (item.priority == filterpriority.value) {
      addItem(item);
    }
  }
});

// 絞り込みを解除する
filterclear.addEventListener('click', () => {
  clearTable();
  for (const item of list) {
    addItem(item);
  }
});

// ポップアップを表示する
clickBtn.addEventListener('click', () => {
  popupWrapper.style.display = "block";
});

// ポップアップの外側又は「x」のマークをクリックしたときポップアップを閉じる
popupWrapper.addEventListener('click', e => {
  if (e.target.id === popupWrapper.id || e.target.id === close.id) {
    popupWrapper.style.display = 'none';
  }
});