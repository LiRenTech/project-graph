<!--
 Author: Redlnn <w731347477@gmail.com>
 Co-Author: I Love Study <1450069615@qq.com>
-->

<template>
  <div class="loading">
    <span></span>
    <span></span>
    <span></span>
    <span></span>
    <span></span>
    <span></span>
  </div>
</template>

<style scoped>
.loading {
  width: 80px;
  height: 60px;
  bottom: 30px;
  margin: 30px auto;
  position: relative;
}
.loading span {
  position: absolute;
  width: 10px;
  bottom: 0px;
  border-radius: 10px;
  background: var(--vp-c-text-2);
  animation: loading 3s infinite ease-in-out;
}
.loading span:nth-child(2) {
  left: 14px;
  animation-delay: 0.2s;
}
.loading span:nth-child(3) {
  left: 28px;
  animation-delay: 0.4s;
}
.loading span:nth-child(4) {
  left: 42px;
  animation-delay: 0.6s;
}
.loading span:nth-child(5) {
  left: 56px;
  animation-delay: 0.8s;
}
.loading span:nth-child(6) {
  left: 70px;
  animation-delay: 1s;
}
@keyframes loading {
  0% {
    height: 5px;
    transform: translateY(0px);
    background: var(--vp-c-text-2);
  }
  25% {
    height: 50px;
    transform: translateY(25px);
    background: var(--vp-c-text-1);
  }
  50% {
    height: 5px;
    transform: translateY(0px);
    background: var(--vp-c-text-2);
  }
  100% {
    height: 5px;
    transform: translateY(0px);
    background: var(--vp-c-text-2);
  }
}
</style>
