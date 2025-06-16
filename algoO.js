// 1. Two Sum
// Найти два числа в массиве, которые в сумме дают target, и вернуть их индексы.

/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function(nums, target) {
    // Создаем хэш-таблицу для хранения чисел и их индексов
    const map = {};
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        // Если complement уже есть в мапе, возвращаем индексы
        if (complement in map) {
            return [map[complement], i];
        }
        // Иначе сохраняем текущее число и его индекс
        map[nums[i]] = i;
    }
    return [];
};

// 2. Palindrome Number
// Проверить, является ли число палиндромом (читается одинаково слева направо и справа налево).
/**
 * @param {number} x
 * @return {boolean}
 */
var isPalindrome = function(x) {
    if (x < 0) return false; // Отрицательные числа не могут быть палиндромами
    let reversed = 0;
    let original = x;
    // Переворачиваем число
    while (original > 0) {
        reversed = reversed * 10 + original % 10;
        original = Math.floor(original / 10);
    }
    return reversed === x;
};

// 3. Valid Parentheses
// Проверить, правильно ли расставлены скобки.
/**
 * @param {string} s
 * @return {boolean}
 */
var isValid = function(s) {
    const stack = [];
    const pairs = { '(': ')', '{': '}', '[': ']' };
    for (const char of s) {
        if (char in pairs) {
            stack.push(char); // Если открывающая скобка, кладем в стек
        } else {
            const last = stack.pop();
            // Если стек пуст или скобка не совпадает, возвращаем false
            if (!last || pairs[last] !== char) {
                return false;
            }
        }
    }
    return stack.length === 0; // Если стек пуст, все скобки закрыты
};

// 4. Reverse String
// Развернуть строку (изменить порядок символов на обратный).
/**
 * @param {character[]} s
 * @return {void} Do not return anything, modify s in-place instead.
 */
var reverseString = function(s) {
    let left = 0, right = s.length - 1;
    while (left < right) {
        // Меняем местами символы
        [s[left], s[right]] = [s[right], s[left]];
        left++;
        right--;
    }
};

// 5. Merge Two Sorted Lists
// Объединить два отсортированных связных списка в один.
/**
 * @param {ListNode} list1
 * @param {ListNode} list2
 * @return {ListNode}
 */
var mergeTwoLists = function(list1, list2) {
    const dummy = new ListNode(); // Фиктивная нода для начала
    let current = dummy;
    while (list1 && list2) {
        if (list1.val < list2.val) {
            current.next = list1;
            list1 = list1.next;
        } else {
            current.next = list2;
            list2 = list2.next;
        }
        current = current.next;
    }
    // Добавляем оставшиеся ноды
    current.next = list1 || list2;
    return dummy.next;
};

// 6. Maximum Subarray
// Найти подмассив с максимальной суммой (алгоритм Кадане).
/**
 * @param {number[]} nums
 * @return {number}
 */
var maxSubArray = function(nums) {
    let maxSum = nums[0];
    let currentSum = nums[0];
    for (let i = 1; i < nums.length; i++) {
        // Выбираем: продолжить подмассив или начать новый
        currentSum = Math.max(nums[i], currentSum + nums[i]);
        maxSum = Math.max(maxSum, currentSum);
    }
    return maxSum;
};


// 7. Climbing Stairs
// Посчитать количество способов подняться по лестнице из n ступенек (шаг +1 или +2).
/**
 * @param {number} n
 * @return {number}
 */
var climbStairs = function(n) {
    if (n <= 2) return n;
    let a = 1, b = 2;
    for (let i = 3; i <= n; i++) {
        [a, b] = [b, a + b]; // Фибоначчи: f(n) = f(n-1) + f(n-2)
    }
    return b;
};

// 8. Binary Search
// Найти индекс элемента в отсортированном массиве (бинарный поиск).
/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number}
 */
var search = function(nums, target) {
    let left = 0, right = nums.length - 1;
    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        if (nums[mid] === target) {
            return mid;
        } else if (nums[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    return -1;
};

// 9. Linked List Cycle
// Проверить, есть ли цикл в связном списке.
/**
 * @param {ListNode} head
 * @return {boolean}
 */
var hasCycle = function(head) {
    let slow = head, fast = head;
    while (fast && fast.next) {
        slow = slow.next;          // Черепаха
        fast = fast.next.next;      // Заяц
        if (slow === fast) return true; // Если встретились, есть цикл
    }
    return false;
};

// 10. Single Number
// Найти число в массиве, которое встречается один раз (остальные — дважды).
/**
 * @param {number[]} nums
 * @return {number}
 */
var singleNumber = function(nums) {
    let result = 0;
    for (const num of nums) {
        result ^= num; // XOR: a ^ a = 0, a ^ 0 = a
    }
    return result;
};