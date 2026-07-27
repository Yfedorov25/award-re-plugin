# 🍳 RECIPE — FOOTER (контакти + великий лого + marquee)
> Lusion (адреса+соцмережі+©), Cuberto (2 офіси). Останнє враження.

## 1. ПРИЗНАЧЕННЯ
Контакти, навігація, фінальний акорд бренду. Часто — великий лого/назва на всю ширину (акцент).

## 2. НОРМИ
- Email, адреса, 3-5 соцмереж, навігація-дублікат, ©рік+бренд.
- Часто гігантський текст-назва бренду (виразний фінал).
- Висота: 0.5-1vh.

## 3. СТРУКТУРА
```html
<footer class="footer">
  <div class="footer__top"><span>hello@brand.com</span><nav>links</nav><div>socials</div></div>
  <div class="footer__big">BRAND</div> <!-- гігантський лого-текст -->
  <div class="footer__bottom"><span>©2026 Brand</span><span>Built with care</span></div>
</footer>
```

## 4. ТИПОГРАФІКА
- Великий лого-текст: clamp(60px,18vw,300px), display, обрізаний знизу в'юпортом (драматично).
- Контакти: 14-16px.

## 5. АНІМАЦІЯ
- Великий лого: parallax при доскролі (E8) або reveal.
- Marquee-стрічка (E5) — соцмережі/слоган.
- Email hover: underline-draw.

## 6-8. Marquee gsap.to xPercent. Мобільний: лого менше, стек. 🟢.
