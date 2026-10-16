#pragma once
#include <iostream>
#include <vector>
#include <string>
#include <queue>
#include <stack>
#include <deque>
#include <map>
#include <set>
#include <unordered_map>
#include <unordered_set>
#include <algorithm>
#include <numeric>
#include <cmath>
#include <climits>
#include <sstream>
#include <memory>
#include <utility>
#include <functional>
#include <tuple>
#include <bitset>
#include <chrono>
#include <iomanip>

using namespace std;

// Sentinel value representing null in tree serialization (e.g. {3, 9, 20, null, null, 15, 7})
constexpr int null = -1000000007;

// ==========================================
// LeetCode Standard Data Structures
// ==========================================

// Singly-linked list
struct ListNode {
    int val;
    ListNode *next;
    ListNode() : val(0), next(nullptr) {}
    ListNode(int x) : val(x), next(nullptr) {}
    ListNode(int x, ListNode *next) : val(x), next(next) {}
};

// Doubly-linked list node
struct DListNode {
    int val;
    DListNode *prev;
    DListNode *next;
    DListNode() : val(0), prev(nullptr), next(nullptr) {}
    DListNode(int x) : val(x), prev(nullptr), next(nullptr) {}
    DListNode(int x, DListNode *p, DListNode *n) : val(x), prev(p), next(n) {}
};
using DoubleListNode = DListNode;

// Binary tree node
struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode() : val(0), left(nullptr), right(nullptr) {}
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
    TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {}
};

// Node (N-ary Tree / Graph / Random Pointer / Doubly with Child)
class Node {
public:
    int val;
    vector<Node*> children;
    vector<Node*> neighbors;
    Node* next;
    Node* prev;
    Node* random;
    Node* left;
    Node* right;
    Node* child;

    Node() : val(0), next(nullptr), prev(nullptr), random(nullptr), left(nullptr), right(nullptr), child(nullptr) {}
    Node(int _val) : val(_val), next(nullptr), prev(nullptr), random(nullptr), left(nullptr), right(nullptr), child(nullptr) {}
    Node(int _val, vector<Node*> _children) : val(_val), children(_children), next(nullptr), prev(nullptr), random(nullptr), left(nullptr), right(nullptr), child(nullptr) {}
    Node(int _val, Node* _prev, Node* _next, Node* _child) : val(_val), children(), neighbors(), next(_next), prev(_prev), random(nullptr), left(nullptr), right(nullptr), child(_child) {}
};

// ==========================================
// Helper Functions: Singly-Linked List
// ==========================================
inline ListNode* createList(const vector<int>& vals) {
    ListNode dummy(0);
    ListNode* tail = &dummy;
    for (int x : vals) {
        tail->next = new ListNode(x);
        tail = tail->next;
    }
    return dummy.next;
}

inline void printList(ListNode* head) {
    cout << "\033[1;34m[List]\033[0m ";
    if (!head) {
        cout << "(empty)\n";
        return;
    }
    while (head) {
        cout << head->val << (head->next ? " -> " : "");
        head = head->next;
    }
    cout << " -> nullptr\n";
}

inline vector<int> listToVector(ListNode* head) {
    vector<int> res;
    while (head) {
        res.push_back(head->val);
        head = head->next;
    }
    return res;
}

inline void freeList(ListNode* head) {
    while (head) {
        ListNode* next = head->next;
        delete head;
        head = next;
    }
}

// ==========================================
// Helper Functions: Doubly-Linked List
// ==========================================
inline DListNode* createDList(const vector<int>& vals) {
    if (vals.empty()) return nullptr;
    DListNode* head = new DListNode(vals[0]);
    DListNode* curr = head;
    for (size_t i = 1; i < vals.size(); ++i) {
        DListNode* node = new DListNode(vals[i]);
        curr->next = node;
        node->prev = curr;
        curr = node;
    }
    return head;
}

inline void printDList(DListNode* head) {
    cout << "\033[1;34m[DoublyList]\033[0m nullptr";
    while (head) {
        cout << " <-> " << head->val;
        head = head->next;
    }
    cout << " <-> nullptr\n";
}

inline void freeDList(DListNode* head) {
    while (head) {
        DListNode* next = head->next;
        delete head;
        head = next;
    }
}

// ==========================================
// Helper Functions: Binary Tree & BST
// ==========================================
inline TreeNode* createTree(const vector<int>& vals) {
    if (vals.empty() || vals[0] == null) return nullptr;
    TreeNode* root = new TreeNode(vals[0]);
    queue<TreeNode*> q;
    q.push(root);
    size_t i = 1;
    while (!q.empty() && i < vals.size()) {
        TreeNode* curr = q.front();
        q.pop();

        if (i < vals.size()) {
            if (vals[i] != null) {
                curr->left = new TreeNode(vals[i]);
                q.push(curr->left);
            }
            i++;
        }
        if (i < vals.size()) {
            if (vals[i] != null) {
                curr->right = new TreeNode(vals[i]);
                q.push(curr->right);
            }
            i++;
        }
    }
    return root;
}

inline TreeNode* insertBST(TreeNode* root, int val) {
    if (!root) return new TreeNode(val);
    if (val < root->val) root->left = insertBST(root->left, val);
    else root->right = insertBST(root->right, val);
    return root;
}

inline TreeNode* createBST(const vector<int>& vals) {
    TreeNode* root = nullptr;
    for (int x : vals) root = insertBST(root, x);
    return root;
}

inline void printTree(TreeNode* root, string prefix = "", bool isLeft = false, bool isRoot = true) {
    if (!root) {
        if (isRoot) cout << "\033[1;35m[Tree]\033[0m (empty)\n";
        return;
    }
    if (isRoot) {
        cout << "\033[1;35m[Tree]\033[0m " << root->val << "\n";
    } else {
        cout << prefix << (isLeft ? "├── " : "└── ") << root->val << "\n";
    }
    string newPrefix = prefix + (isRoot ? "       " : (isLeft ? "│   " : "    "));
    if (root->left || root->right) {
        if (root->left) {
            printTree(root->left, newPrefix, true, false);
        } else {
            cout << newPrefix << "├── (null)\n";
        }
        if (root->right) {
            printTree(root->right, newPrefix, false, false);
        } else {
            cout << newPrefix << "└── (null)\n";
        }
    }
}

inline void freeTree(TreeNode* root) {
    if (!root) return;
    freeTree(root->left);
    freeTree(root->right);
    delete root;
}

// ==========================================
// Helper Functions: 2D Grid / Matrix
// ==========================================
template<typename T>
inline void printGrid(const vector<vector<T>>& grid) {
    cout << "\033[1;33m[Grid " << grid.size() << "x" << (grid.empty() ? 0 : grid[0].size()) << "]:\033[0m\n";
    for (const auto& row : grid) {
        cout << "  [ ";
        for (const auto& val : row) {
            cout << setw(3) << val << " ";
        }
        cout << "]\n";
    }
}

// ==========================================
// Container & Node Pretty Printing
// ==========================================
template<typename T1, typename T2>
ostream& operator<<(ostream& os, const pair<T1, T2>& p);

template<typename T>
ostream& operator<<(ostream& os, const vector<T>& v);

template<typename T>
ostream& operator<<(ostream& os, const deque<T>& d);

template<typename T>
ostream& operator<<(ostream& os, const set<T>& s);

template<typename T>
ostream& operator<<(ostream& os, const unordered_set<T>& s);

template<typename K, typename V>
ostream& operator<<(ostream& os, const map<K, V>& m);

template<typename K, typename V>
ostream& operator<<(ostream& os, const unordered_map<K, V>& m);

inline ostream& operator<<(ostream& os, ListNode* head) {
    os << "[List: ";
    if (!head) return os << "nullptr]";
    while (head) {
        os << head->val << (head->next ? " -> " : "");
        head = head->next;
    }
    return os << " -> nullptr]";
}

inline ostream& operator<<(ostream& os, DListNode* head) {
    os << "[DoublyList: nullptr";
    while (head) {
        os << " <-> " << head->val;
        head = head->next;
    }
    return os << " <-> nullptr]";
}

inline ostream& operator<<(ostream& os, TreeNode* root) {
    if (!root) return os << "[Tree: nullptr]";
    return os << "[Tree(val=" << root->val 
              << ", left=" << (root->left ? to_string(root->left->val) : "null")
              << ", right=" << (root->right ? to_string(root->right->val) : "null") << ")]";
}

template<typename T1, typename T2>
inline ostream& operator<<(ostream& os, const pair<T1, T2>& p) {
    return os << "{" << p.first << ", " << p.second << "}";
}

template<typename T>
inline ostream& operator<<(ostream& os, const vector<T>& v) {
    os << "[";
    for (size_t i = 0; i < v.size(); ++i) {
        os << v[i] << (i + 1 < v.size() ? ", " : "");
    }
    return os << "]";
}

template<typename T>
inline ostream& operator<<(ostream& os, const deque<T>& d) {
    os << "[";
    for (size_t i = 0; i < d.size(); ++i) {
        os << d[i] << (i + 1 < d.size() ? ", " : "");
    }
    return os << "]";
}

template<typename T>
inline ostream& operator<<(ostream& os, const set<T>& s) {
    os << "{";
    size_t i = 0;
    for (const auto& x : s) {
        os << x << (++i < s.size() ? ", " : "");
    }
    return os << "}";
}

template<typename T>
inline ostream& operator<<(ostream& os, const unordered_set<T>& s) {
    os << "{";
    size_t i = 0;
    for (const auto& x : s) {
        os << x << (++i < s.size() ? ", " : "");
    }
    return os << "}";
}

template<typename K, typename V>
inline ostream& operator<<(ostream& os, const map<K, V>& m) {
    os << "{";
    size_t i = 0;
    for (const auto& [k, v] : m) {
        os << k << ": " << v << (++i < m.size() ? ", " : "");
    }
    return os << "}";
}

template<typename K, typename V>
inline ostream& operator<<(ostream& os, const unordered_map<K, V>& m) {
    os << "{";
    size_t i = 0;
    for (const auto& [k, v] : m) {
        os << k << ": " << v << (++i < m.size() ? ", " : "");
    }
    return os << "}";
}

// ==========================================
// Debug & Benchmark Macros
// ==========================================
#ifndef dbg
#define dbg(x) cout << "\033[1;36m[DEBUG L" << __LINE__ << "]\033[0m " << #x << " = " << (x) << endl
#endif

#ifndef dbg2
#define dbg2(a, b) cout << "\033[1;36m[DEBUG L" << __LINE__ << "]\033[0m " << #a << " = " << (a) << ", " << #b << " = " << (b) << endl
#endif

#define LC_TIMER_START auto _lc_start = chrono::high_resolution_clock::now();
#define LC_TIMER_END do { \
    auto _lc_end = chrono::high_resolution_clock::now(); \
    auto _lc_us = chrono::duration_cast<chrono::microseconds>(_lc_end - _lc_start).count(); \
    cout << "\033[1;32m[TIMER]\033[0m " << _lc_us << " µs (" << fixed << setprecision(3) << (_lc_us / 1000.0) << " ms)\n"; \
} while(0)
