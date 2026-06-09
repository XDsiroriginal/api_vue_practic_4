import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/Index.vue'
import Index from "@/components/Index.vue";
import Cart from "@/components/Cart.vue";
import Catalog from "@/components/Catalog.vue";
import CreateOrder from "@/components/CreateOrder.vue";
import SignIn from "@/components/SignIn.vue";
import SignOut from "@/components/SignOut.vue";
import SignUp from "@/components/SignUp.vue";

const routes = [
  {
    path: '/',
    name: 'index',
    component: Index
  },
  {
    path: '/cart',
    name: 'cart',
    component: Cart
  },
  {
    path: '/catalog',
    name: 'catalog',
    component: Catalog
  },
  {
    path: '/create-order',
    name: 'create-order',
    component: CreateOrder
  },
  {
    path: '/sign-in',
    name: 'sign-in',
    component: SignIn
  },
  {
    path: '/sign-out',
    name: 'sign-out',
    component: SignOut
  },
  {
    path: '/sign-up',
    name: 'sign-up',
    component: SignUp
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
