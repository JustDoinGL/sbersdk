/* 
===========================================
1. Two Sum (Сумма двух чисел)
===========================================
Задача: Найти в массиве два числа, которые в сумме дают заданное значение (target), 
и вернуть их индексы. Гарантируется, что решение существует, и оно единственное.

Пример:
Вход: nums = [2, 7, 11, 15], target = 9
Выход: [0, 1] (потому что nums[0] + nums[1] = 2 + 7 = 9)
*/
var twoSum = function (nums, target) {
  // Реализация здесь
};

// Тест-кейсы
console.log("1. Two Sum:");
console.log(twoSum([2, 7, 11, 15], 9)); // [0, 1]
console.log(twoSum([3, 2, 4], 6)); // [1, 2]
console.log(twoSum([3, 3], 6)); // [0, 1]
console.log(twoSum([-1, -2, -3, -4], -6)); // [1, 3]
console.log(twoSum([1, 2, 3], 10)); // [] (нет решения)

/* 
===========================================
2. Palindrome Number (Число-палиндром)
===========================================
Задача: Определить, является ли число палиндромом 
(читается одинаково слева направо и справа налево).

Пример:
Вход: x = 121
Выход: true
*/
var isPalindrome = function (x) {
  // Реализация здесь
};

// Тест-кейсы
console.log("\n2. Palindrome Number:");
console.log(isPalindrome(121)); // true
console.log(isPalindrome(-121)); // false (минус не считается)
console.log(isPalindrome(10)); // false
console.log(isPalindrome(12321)); // true
console.log(isPalindrome(0)); // true

/* 
===========================================
3. Valid Parentheses (Валидные скобки)
===========================================
Задача: Проверить, правильно ли расставлены скобки в строке. 
Допустимые типы: '()', '[]', '{}'.

Пример:
Вход: s = "()[]{}"
Выход: true
*/
var isValid = function (s) {
  // Реализация здесь
};

// Тест-кейсы
console.log("\n3. Valid Parentheses:");
console.log(isValid("()")); // true
console.log(isValid("()[]{}")); // true
console.log(isValid("(]")); // false
console.log(isValid("([)]")); // false
console.log(isValid("{[]}")); // true

/* 
===========================================
4. Reverse String (Переворот строки)
===========================================
Задача: Перевернуть массив символов строки на месте (без выделения дополнительной памяти).

Пример:
Вход: s = ["h","e","l","l","o"]
Выход: ["o","l","l","e","h"]
*/
var reverseString = function (s) {
  // Реализация здесь
};

// Тест-кейсы
console.log("\n4. Reverse String:");
let str1 = ["h", "e", "l", "l", "o"];
reverseString(str1);
console.log(str1); // ["o","l","l","e","h"]

let str2 = ["H", "a", "n", "n", "a", "h"];
reverseString(str2);
console.log(str2); // ["h","a","n","n","a","H"]

/* 
===========================================
5. Merge Two Sorted Lists (Слияние двух отсортированных списков)
===========================================
Задача: Объединить два отсортированных связных списка в один отсортированный.

Пример:
Вход: list1 = [1,2,4], list2 = [1,3,4]
Выход: [1,1,2,3,4,4]
*/
function ListNode(val, next) {
  this.val = val === undefined ? 0 : val;
  this.next = next === undefined ? null : next;
}

var mergeTwoLists = function (list1, list2) {
  // Реализация здесь
};

// Тест-кейсы
console.log("\n5. Merge Two Sorted Lists:");
let list1 = new ListNode(1, new ListNode(2, new ListNode(4)));
let list2 = new ListNode(1, new ListNode(3, new ListNode(4)));
console.log(printList(mergeTwoLists(list1, list2))); // [1,1,2,3,4,4]

/* 
===========================================
6. Maximum Subarray (Максимальный подмассив)
===========================================
Задача: Найти подмассив (последовательность элементов) с максимальной суммой.

Пример:
Вход: nums = [-2,1,-3,4,-1,2,1,-5,4]
Выход: 6 (подмассив [4,-1,2,1])
*/
var maxSubArray = function (nums) {
  // Реализация здесь
};

// Тест-кейсы
console.log("\n6. Maximum Subarray:");
console.log(maxSubArray([-2, 1, -3, 4, -1, 2, 1, -5, 4])); // 6
console.log(maxSubArray([1])); // 1

/* 
===========================================
7. Climbing Stairs (Подъем по лестнице)
===========================================
Задача: Дано n ступенек. За один шаг можно подняться на 1 или 2 ступеньки. 
Сколько есть способов подняться наверх?

Пример:
Вход: n = 3
Выход: 3 (1+1+1, 1+2, 2+1)
*/
var climbStairs = function (n) {
  // Реализация здесь
};

// Тест-кейсы
console.log("\n7. Climbing Stairs:");
console.log(climbStairs(2)); // 2
console.log(climbStairs(3)); // 3

/* 
===========================================
8. Binary Search (Бинарный поиск)
===========================================
Задача: Найти индекс элемента target в отсортированном массиве. 
Если элемента нет, вернуть -1.

Пример:
Вход: nums = [-1,0,3,5,9,12], target = 9
Выход: 4
*/
var search = function (nums, target) {
  // Реализация здесь
};

// Тест-кейсы
console.log("\n8. Binary Search:");
console.log(search([-1, 0, 3, 5, 9, 12], 9)); // 4
console.log(search([-1, 0, 3, 5, 9, 12], 2)); // -1

/* 
===========================================
9. Linked List Cycle (Цикл в связном списке)
===========================================
Задача: Определить, содержит ли связный список цикл.

Пример:
Вход: head = [3,2,0,-4] (где -4 ссылается на 2)
Выход: true
*/
var hasCycle = function (head) {
  // Реализация здесь
};

// Тест-кейсы
console.log("\n9. Linked List Cycle:");
let cycleNode = new ListNode(3);
cycleNode.next = new ListNode(2);
cycleNode.next.next = new ListNode(0);
cycleNode.next.next.next = new ListNode(-4);
cycleNode.next.next.next.next = cycleNode.next; // Зацикливание
console.log(hasCycle(cycleNode)); // true

/* 
===========================================
10. Single Number (Одиночное число)
===========================================
Задача: В массиве все числа встречаются дважды, кроме одного. Найти это число.

Пример:
Вход: nums = [4,1,2,1,2]
Выход: 4
*/
var singleNumber = function (nums) {
  // Реализация здесь
};

// Тест-кейсы
console.log("\n10. Single Number:");
console.log(singleNumber([2, 2, 1])); // 1
console.log(singleNumber([4, 1, 2, 1, 2])); // 4
