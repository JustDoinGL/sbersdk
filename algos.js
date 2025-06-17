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


/**
 * Задачи на технику Two Pointers с тест-кейсами, шаблонами функций и консоль-логами
 */

/**
 * 1. Two Sum II - Input Array Is Sorted
 */
function twoSumSorted(numbers, target) {
    // Ваш код здесь
}

// Тестирование
console.log(twoSumSorted([2,7,11,15], 9)); // Должно вывести: [1,2]
console.log(twoSumSorted([2,3,4], 6));    // Должно вывести: [1,3]
console.log(twoSumSorted([-1,0], -1));    // Должно вывести: [1,2]

/**
 * 2. Container With Most Water
 */
function maxWaterContainer(height) {
    // Ваш код здесь
}

// Тестирование
console.log(maxWaterContainer([1,8,6,2,5,4,8,3,7])); // Должно вывести: 49
console.log(maxWaterContainer([1,1]));               // Должно вывести: 1
console.log(maxWaterContainer([4,3,2,1,4]));        // Должно вывести: 16

/**
 * 3. Remove Duplicates from Sorted Array
 */
function removeDuplicates(nums) {
    // Ваш код здесь (изменяет исходный массив)
    return 0; // Замените на реальный результат
}

// Тестирование
let nums1 = [1,1,2];
console.log(removeDuplicates(nums1), nums1); // Должно вывести: 2 [1,2,_]
let nums2 = [0,0,1,1,1,2,2,3,3,4];
console.log(removeDuplicates(nums2), nums2); // Должно вывести: 5 [0,1,2,3,4,_,_,_,_,_]
console.log(removeDuplicates([1]));         // Должно вывести: 1 [1]

/**
 * 4. Move Zeroes
 */
function moveZeroes(nums) {
    // Ваш код здесь (изменяет исходный массив)
}

// Тестирование
let zeros1 = [0,1,0,3,12];
moveZeroes(zeros1);
console.log(zeros1); // Должно вывести: [1,3,12,0,0]
let zeros2 = [0];
moveZeroes(zeros2);
console.log(zeros2); // Должно вывести: [0]
let zeros3 = [1,0,1];
moveZeroes(zeros3);
console.log(zeros3); // Должно вывести: [1,1,0]

/**
 * 5. Valid Palindrome
 */
function isPalindrome(s) {
    // Ваш код здесь
}

// Тестирование
console.log(isPalindrome("A man, a plan, a canal: Panama")); // Должно вывести: true
console.log(isPalindrome("race a car"));                    // Должно вывести: false
console.log(isPalindrome(" "));                             // Должно вывести: true

/**
 * 6. 3Sum
 */
function threeSum(nums) {
    // Ваш код здесь
}

// Тестирование
console.log(threeSum([-1,0,1,2,-1,-4])); // Должно вывести: [[-1,-1,2],[-1,0,1]]
console.log(threeSum([0,1,1]));          // Должно вывести: []
console.log(threeSum([0,0,0]));          // Должно вывести: [[0,0,0]]

/**
 * 7. Trapping Rain Water
 */
function trapRainWater(height) {
    // Ваш код здесь
}

// Тестирование
console.log(trapRainWater([0,1,0,2,1,0,1,3,2,1,2,1])); // Должно вывести: 6
console.log(trapRainWater([4,2,0,3,2,5]));             // Должно вывести: 9
console.log(trapRainWater([4,2,3]));                   // Должно вывести: 1

/**
 * 8. Subarray Product Less Than K
 */
function numSubarrayProductLessThanK(nums, k) {
    // Ваш код здесь
}

// Тестирование
console.log(numSubarrayProductLessThanK([10,5,2,6], 100)); // Должно вывести: 8
console.log(numSubarrayProductLessThanK([1,2,3], 0));      // Должно вывести: 0
console.log(numSubarrayProductLessThanK([1,1,1], 2));      // Должно вывести: 6