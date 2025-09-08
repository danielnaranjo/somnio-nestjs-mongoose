// Core Application Module
angular.module('productApp.core', []);

// Services Module
angular.module('productApp.services', ['productApp.core']);

// Components Module
angular.module('productApp.components', ['productApp.services']);

// Main Application Module
angular.module('productApp', [
    'ngRoute',
    'productApp.core',
    'productApp.services',
    'productApp.components',
]);

// ===========================================
// CORE MODULE - Configuration & Constants
// ===========================================

angular
    .module('productApp.core')
    .constant('API_CONFIG', {
        BASE_URL: '/api/',
        ENDPOINTS: {
            PRODUCTS: 'products',
            SEARCH: 'products/search',
        },
        DEFAULT_PAGE_SIZE: 10,
        SEARCH_DEBOUNCE: 300,
    })
    .constant('UI_CONFIG', {
        INITIAL_DISPLAY: 9,
        LOAD_MORE_INCREMENT: 9,
        ANIMATION_DURATION: 300,
    });

// Route Configuration
angular.module('productApp').config([
    '$routeProvider',
    function ($routeProvider) {
        $routeProvider
            .when('/', {
                template: '', // Using components in main HTML
                controller: 'AppController',
            })
            .otherwise({
                redirectTo: '/',
            });
    },
]);

// ===========================================
// SERVICES MODULE
// ===========================================

// Product API Service
angular.module('productApp.services').service('ProductApiService', [
    '$http',
    '$q',
    'API_CONFIG',
    function ($http, $q, API_CONFIG) {
        var self = this;

        self.getProducts = function (page, pageSize) {
            var params = { offset: page, limit: pageSize };
            return $http
                .get(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.PRODUCTS, {
                    params: params,
                })
                .then(function (response) {
                    return {
                        data: response.data.items || response.data,
                        total: response.data.total || response.data.length,
                        offset: page,
                        pageSize: pageSize,
                    };
                });
        };

        self.searchProducts = function (query) {
            var params = { q: query };
            return $http
                .get(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.SEARCH, {
                    params: params,
                })
                .then(function (response) {
                    return {
                        data: response.data.items || response.data,
                        total: response.data.total || response.data.length,
                    };
                });
        };
    },
]);

// Product State Service
angular.module('productApp.services').service('ProductStateService', [
    'ProductApiService',
    '$q',
    'API_CONFIG',
    function (ProductApiService, $q, API_CONFIG) {
        var self = this;

        // State properties
        self.products = [];
        self.currentPage = 1;
        self.pageSize = API_CONFIG.DEFAULT_PAGE_SIZE;
        self.totalProducts = 0;
        self.isLoading = false;
        self.currentSearchQuery = '';

        // Load products
        self.loadProducts = function (page) {
            offset = page || 1;
            self.isLoading = true;

            return ProductApiService.getProducts(page, self.pageSize)
                .then(function (response) {
                    if (page === 1) {
                        self.products = response.data;
                    } else {
                        console.log('###', self.products, response.data.results);
                        self.products = self.products.concat(response.data.results);
                    }
                    self.totalProducts = response.total;
                    self.currentPage = page;
                    return response;
                })
                .finally(function () {
                    self.isLoading = false;
                });
        };

        // Search products
        self.searchProducts = function (query) {
            self.isLoading = true;
            self.currentSearchQuery = query;

            if (!query || query.trim() === '') {
                return self.loadProducts(1);
            }

            return ProductApiService.searchProducts(query)
                .then(function (response) {
                    self.products = response.data;
                    self.totalProducts = response.total;
                    self.currentPage = 1;
                    return response;
                })
                .finally(function () {
                    self.isLoading = false;
                });
        };

        // Check if more products available
        self.hasMoreProducts = function () {
            return self.products.results.length < self.totalProducts;
        };

        // Reset state
        self.reset = function () {
            self.products = [];
            self.currentPage = 1;
            self.totalProducts = 0;
            self.currentSearchQuery = '';
        };

        // Get current state
        self.getState = function () {
            return {
                products: self.products.results,
                isLoading: self.isLoading,
                hasMore: self.hasMoreProducts(),
                currentPage: self.currentPage,
                totalProducts: self.products.total,
                searchQuery: self.currentSearchQuery,
            };
        };
    },
]);

// Search Debounce Service
angular.module('productApp.services').service('DebounceService', [
    '$timeout',
    'API_CONFIG',
    function ($timeout, API_CONFIG) {
        var self = this;
        var timeouts = {};

        self.debounce = function (key, fn, delay) {
            delay = delay || API_CONFIG.SEARCH_DEBOUNCE;

            if (timeouts[key]) {
                $timeout.cancel(timeouts[key]);
            }

            timeouts[key] = $timeout(fn, delay);
            return timeouts[key];
        };
    },
]);

// ===========================================
// COMPONENTS MODULE
// ===========================================

// Header Component
angular.module('productApp.components').component('appHeader', {
    template: `
                    <header class="header">
                        <div class="container">
                            <div class="header-content">
                                <div class="logo" ng-click="$ctrl.onLogoClick()">ProductStore</div>
                                <search-bar search-query="$ctrl.searchQuery" 
                                          on-search="$ctrl.onSearch()"></search-bar>
                            </div>
                        </div>
                    </header>
                `,
    bindings: {
        searchQuery: '=',
        onSearch: '&',
    },
    controller: function () {
        var ctrl = this;

        ctrl.onLogoClick = function () {
            // Navigate to home or refresh
            window.location.hash = '/';
        };
    },
});

// Search Bar Component
angular.module('productApp.components').component('searchBar', {
    template: `
                    <div class="search-container">
                        <input type="text" 
                               class="search-bar" 
                               placeholder="Search products..."
                               ng-model="$ctrl.searchQuery"
                               ng-change="$ctrl.handleSearchChange()">
                    </div>
                `,
    bindings: {
        searchQuery: '=',
        onSearch: '&',
    },
    controller: [
        'DebounceService',
        function (DebounceService) {
            var ctrl = this;

            ctrl.handleSearchChange = function () {
                DebounceService.debounce('search', function () {
                    ctrl.onSearch();
                });
            };
        },
    ],
});

// Product Grid Component
angular.module('productApp.components').component('productGrid', {
    template: `
                    <div class="product-grid">
                        <product-card ng-repeat="product in $ctrl.products track by product._id" 
                                    product="product"></product-card>
                    </div>
                `,
    bindings: {
        products: '<',
    },
});

// Product Card Component
angular.module('productApp.components').component('productCard', {
    template: `
                    <div class="product-card">
                        <h3 class="product-title">{{ $ctrl.product.name }}</h3>
                        <p class="product-description">{{ $ctrl.product.description }}</p>
                        <div class="product-price">\${{ $ctrl.product.price | number:2 }}</div>
                    </div>
                `,
    bindings: {
        product: '<',
    },
    controller: function () {
        var ctrl = this;

        ctrl.$onInit = function () {
            // Component initialization logic
            if (!ctrl.product) {
                console.warn('ProductCard: No product data provided');
            }
        };
    },
});

// Loading Spinner Component
angular.module('productApp.components').component('loadingSpinner', {
    template: `
                    <div class="loading">
                        <span class="spinner"></span>
                        {{ $ctrl.message || 'Loading products...' }}
                    </div>
                `,
    bindings: {
        message: '@?',
    },
});

// Error Message Component
angular.module('productApp.components').component('errorMessage', {
    template: `
                    <div class="error">
                        <div>{{ $ctrl.message }}</div>
                        <button ng-if="$ctrl.onRetry" 
                                class="error-retry" 
                                ng-click="$ctrl.onRetry()">
                            Try Again
                        </button>
                    </div>
                `,
    bindings: {
        message: '<',
        onRetry: '&?',
    },
});

// Load More Button Component
angular.module('productApp.components').component('loadMoreButton', {
    template: `
                    <div class="load-more-container">
                        <button class="load-more-btn" 
                                ng-click="$ctrl.onLoadMore()" 
                                ng-disabled="$ctrl.isLoading">
                            <span ng-if="$ctrl.isLoading" class="spinner"></span>
                            {{ $ctrl.isLoading ? 'Loading...' : 'LOAD MORE' }}
                        </button>
                    </div>
                `,
    bindings: {
        onLoadMore: '&',
        isLoading: '<',
    },
});

// No Results Component
angular.module('productApp.components').component('noResults', {
    template: `
                    <div class="no-results">
                        <div class="no-results-icon">🔍</div>
                        <h3>No products found</h3>
                        <p>Try adjusting your search terms</p>
                    </div>
                `,
});

// ===========================================
// CONTROLLERS
// ===========================================

// Main Application Controller
angular.module('productApp').controller('AppController', [
    '$scope',
    'ProductStateService',
    'UI_CONFIG',
    function ($scope, ProductStateService, UI_CONFIG) {
        // Initialize scope variables
        $scope.products = [];
        $scope.displayedProducts = [];
        $scope.isLoading = false;
        $scope.error = null;
        $scope.searchQuery = '';
        $scope.displayCount = UI_CONFIG.INITIAL_DISPLAY;

        // Initialize the application
        function init() {
            loadInitialProducts();
        }

        // Load initial products
        function loadInitialProducts() {
            $scope.error = null;

            ProductStateService.loadProducts(1)
                .then(function () {
                    updateScopeFromService();
                    updateDisplayedProducts();
                })
                .catch(function (error) {
                    $scope.error = 'Failed to load products. Please try again.';
                })
                .finally(function () {
                    $scope.$apply();
                });
        }

        // Update scope from service state
        function updateScopeFromService() {
            var state = ProductStateService.getState();
            $scope.products = state.products;
            $scope.isLoading = state.isLoading;
        }

        // Update displayed products based on display count
        function updateDisplayedProducts() {
            $scope.displayedProducts = $scope.products.slice(0, $scope.displayCount);
        }

        // Handle search
        $scope.onSearch = function () {
            $scope.error = null;
            $scope.displayCount = UI_CONFIG.INITIAL_DISPLAY;

            ProductStateService.searchProducts($scope.searchQuery)
                .then(function () {
                    updateScopeFromService();
                    updateDisplayedProducts();
                })
                .catch(function (error) {
                    $scope.error = 'Failed to search products.';
                })
                .finally(function () {
                    $scope.$apply();
                });
        };

        // Load more products
        $scope.loadMore = function () {
            // Always fetch next page from API when more products are available
            if (ProductStateService.hasMoreProducts()) {
                ProductStateService.loadProducts(ProductStateService.currentPage + 1)
                    .then(function () {
                        updateScopeFromService();
                        // Show all loaded products
                        $scope.displayCount = $scope.products.length;
                        updateDisplayedProducts();
                    })
                    .catch(function (error) {
                        $scope.error = 'Failed to load more products.';
                    })
                    .finally(function () {
                        $scope.$apply();
                    });
            }
        };

        // Check if more products can be loaded
        $scope.canLoadMore = function () {
            return (
                $scope.displayedProducts.length < $scope.products.total ||
                ProductStateService.hasMoreProducts()
            );
        };

        // Retry loading products
        $scope.retryLoad = function () {
            if ($scope.searchQuery) {
                $scope.onSearch();
            } else {
                loadInitialProducts();
            }
        };

        // Watch for service state changes
        $scope.$watch(
            function () {
                return ProductStateService.getState();
            },
            function (newState) {
                if (newState) {
                    $scope.isLoading = newState.isLoading;
                }
            },
            true,
        );

        // Initialize the application
        init();
    },
]);

// ===========================================
// FILTERS (if needed)
// ===========================================

angular.module('productApp').filter('currency', function () {
    return function (input) {
        if (isNaN(input)) return input;
        return '$' + parseFloat(input).toFixed(2);
    };
});

// ===========================================
// APP INITIALIZATION
// ===========================================

// Bootstrap the application when DOM is ready
angular.element(document).ready(function () {
    angular.bootstrap(document, ['productApp']);
});
