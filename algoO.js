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


/**
 * Решения задач на технику Two Pointers с LeetCode
 */

/**
 * 1. Two Sum II - Input Array Is Sorted (LeetCode 167)
 * Найти два числа в отсортированном массиве, которые в сумме дают target.
 */
function twoSum(numbers, target) {
    let left = 0;
    let right = numbers.length - 1;
    
    while (left < right) {
        const sum = numbers[left] + numbers[right];
        if (sum === target) {
            return [left + 1, right + 1]; // +1 потому что индексы начинаются с 1
        } else if (sum < target) {
            left++;
        } else {
            right--;
        }
    }
    return [];
}

/**
 * 2. Container With Most Water (LeetCode 11)
 * Найти два столбца, которые образуют контейнер с наибольшим количеством воды.
 */
function maxArea(height) {
    let max = 0;
    let left = 0;
    let right = height.length - 1;
    
    while (left < right) {
        const h = Math.min(height[left], height[right]);
        const w = right - left;
        max = Math.max(max, h * w);
        
        if (height[left] < height[right]) {
            left++;
        } else {
            right--;
        }
    }
    
    return max;
}

/**
 * 3. Remove Duplicates from Sorted Array (LeetCode 26)
 * Удалить дубликаты из отсортированного массива на месте.
 */
function removeDuplicates(nums) {
    if (nums.length === 0) return 0;
    
    let pointer = 0;
    for (let i = 1; i < nums.length; i++) {
        if (nums[i] !== nums[pointer]) {
            pointer++;
            nums[pointer] = nums[i];
        }
    }
    
    return pointer + 1;
}

/**
 * 4. Move Zeroes (LeetCode 283)
 * Переместить все нули в конец массива, сохраняя порядок ненулевых элементов.
 */
function moveZeroes(nums) {
    let pointer = 0;
    for (let i = 0; i < nums.length; i++) {
        if (nums[i] !== 0) {
            [nums[pointer], nums[i]] = [nums[i], nums[pointer]];
            pointer++;
        }
    }
}

/**
 * 5. Linked List Cycle (LeetCode 141)
 * Определить, содержит ли связанный список цикл (быстрый и медленный указатель).
 */
function hasCycle(head) {
    if (!head || !head.next) return false;
    
    let slow = head;
    let fast = head.next;
    
    while (slow !== fast) {
        if (!fast || !fast.next) return false;
        slow = slow.next;
        fast = fast.next.next;
    }
    
    return true;
}

/**
 * 6. Valid Palindrome (LeetCode 125)
 * Проверить, является ли строка палиндромом, игнорируя не-алфавитные символы.
 */
function isPalindrome(s) {
    const cleaned = s.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    let left = 0;
    let right = cleaned.length - 1;
    
    while (left < right) {
        if (cleaned[left] !== cleaned[right]) return false;
        left++;
        right--;
    }
    
    return true;
}

/**
 * 7. 3Sum (LeetCode 15)
 * Найти все уникальные тройки чисел, которые в сумме дают 0.
 */
function threeSum(nums) {
    nums.sort((a, b) => a - b);
    const result = [];
    
    for (let i = 0; i < nums.length - 2; i++) {
        if (i > 0 && nums[i] === nums[i - 1]) continue;
        
        let left = i + 1;
        let right = nums.length - 1;
        
        while (left < right) {
            const sum = nums[i] + nums[left] + nums[right];
            if (sum === 0) {
                result.push([nums[i], nums[left], nums[right]]);
                while (left < right && nums[left] === nums[left + 1]) left++;
                while (left < right && nums[right] === nums[right - 1]) right--;
                left++;
                right--;
            } else if (sum < 0) {
                left++;
            } else {
                right--;
            }
        }
    }
    
    return result;
}