<template>
  <nav>
    <router-link to="/">Главная</router-link>
    <router-link to="/cart">Корзина</router-link>
    <router-link to="/catalog">Каталог</router-link>
    <router-link to="/create-order">Заказать</router-link>
    <router-link to="/sign-up">Регистрация</router-link>
    <router-link to="/sign-in">Вход</router-link>
    <router-link to="/sign-out">Выход</router-link>
  </nav>
  <router-view/>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

nav {
  padding: 30px;
  display: flex;
  justify-content: center;
  gap: 15px;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
}

nav a.router-link-exact-active {
  color: #42b983;
}
</style>
