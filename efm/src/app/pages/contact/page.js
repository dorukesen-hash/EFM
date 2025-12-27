export const metadata = {
  title: "İletişim - BHM Hukuk",
  description: "BHM Hukuk ile iletişime geçin. Sorularınız ve hukuki ihtiyaçlarınız için bize ulaşın.",
};

export default function ContactPage() {
  return (
      <div className="bg-background text-primary flex flex-col items-center min-h-screen">
          {/* Hero Section */}
          <section className="max-w-[1440px] w-full bg-foreground text-primary py-24 border-b-1 border-secondary">
              <div className="container mx-auto px-4 flex items-center justify-center flex-col">
                  <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
                      İletişim
                  </h1>
              </div>
          </section>
        <div className="mb-10 grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-[1440px] pt-20 page-container">
          <div className="flex flex-col gap-4">
            <a href="tel:+905339490553" className="group min-h-[140px] md:min-h-[180px] flex flex-col sm:flex-row items-center justify-center gap-4 p-4 border-1 rounded-md border-gray-300 hover:border-secondary">
                <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
                     width="48" height="48" viewBox="0 0 512.000000 512.000000">
                    <g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)"
                        stroke="none" className="group-hover:fill-secondary">
                        <path d="M2770 5102 c-98 -49 -107 -188 -15 -248 14 -9 82 -29 153 -45 214
                            -47 320 -82 512 -169 275 -125 519 -298 746 -531 328 -337 543 -741 643 -1210
                            27 -127 34 -143 73 -172 63 -46 140 -42 191 11 46 48 49 79 21 215 -200 984
                            -945 1798 -1909 2086 -110 33 -322 81 -357 81 -13 0 -39 -8 -58 -18z"/>
                        <path d="M839 4801 c-128 -41 -235 -130 -535 -448 -215 -227 -273 -342 -293
                            -571 -29 -326 81 -739 324 -1217 102 -202 148 -281 278 -475 490 -734 1133
                            -1319 1892 -1723 430 -229 794 -346 1125 -363 234 -13 442 53 598 188 19 16
                            134 131 256 257 202 207 225 235 264 312 75 150 76 285 1 439 -41 83 -51 94
                            -413 456 -351 352 -375 374 -447 408 -153 72 -310 65 -459 -21 -25 -15 -138
                            -118 -252 -231 l-207 -204 -99 53 c-440 232 -1018 814 -1232 1240 l-39 76 192
                            194 c205 207 255 269 288 363 44 128 35 250 -28 379 -33 66 -67 103 -407 443
                            -387 387 -418 413 -536 448 -72 21 -200 20 -271 -3z m224 -291 c62 -29 709
                            -679 736 -740 52 -115 30 -153 -244 -425 -123 -121 -230 -235 -240 -254 -28
                            -56 -16 -157 30 -255 129 -274 337 -550 654 -866 261 -261 529 -462 800 -601
                            113 -59 128 -64 185 -63 39 0 74 7 96 18 19 10 136 119 260 241 124 122 240
                            230 259 240 50 25 138 17 188 -18 71 -49 679 -669 703 -716 29 -58 29 -124 0
                            -182 -22 -42 -344 -380 -455 -476 -160 -140 -385 -157 -755 -57 -270 73 -687
                            275 -1030 499 -730 478 -1398 1251 -1736 2010 -217 488 -270 862 -156 1095 20
                            42 81 110 257 288 145 148 247 243 275 257 56 30 117 31 173 5z"/>
                                                    <path d="M2722 4170 c-68 -42 -92 -132 -52 -197 28 -46 52 -58 173 -88 277
                            -68 500 -195 689 -394 179 -187 300 -413 353 -656 21 -94 35 -126 71 -154 81
                            -64 211 -17 229 83 15 76 -60 337 -147 510 -223 450 -627 774 -1113 892 -121
                            29 -160 30 -203 4z"/>
                    </g>
                </svg>
                <p className="text-center sm:text-start"><strong>Cep:</strong><br/> 0533 949 05 53</p>
            </a>
              <a href="https://wa.me/905339490553" target="_blank" className="group min-h-[140px] md:min-h-[180px] flex flex-col sm:flex-row items-center justify-center gap-4 border-1 rounded-md border-gray-300 hover:border-secondary" rel="noopener noreferrer">
                  <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
                       width="48" height="48" viewBox="0 0 512.000000 512.000000"
                       preserveAspectRatio="xMidYMid meet">

                      <g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)"
                         fill="#25D366" stroke="none">
                          <path d="M2415 5114 c-288 -30 -508 -81 -735 -171 -317 -125 -575 -292 -823
                            -533 -475 -459 -736 -1038 -763 -1696 -18 -425 89 -887 292 -1261 24 -44 44
                            -87 44 -95 0 -7 -97 -298 -215 -646 -118 -349 -215 -642 -215 -651 0 -21 40
                            -61 62 -61 8 0 312 94 676 210 363 115 667 210 675 210 8 0 65 -24 128 -54
                            205 -98 460 -174 709 -213 162 -25 548 -25 710 0 549 85 1041 331 1425 712
                            236 234 425 518 549 820 78 193 129 383 168 630 16 109 17 494 0 615 -84 599
                            -352 1117 -783 1517 -377 349 -834 567 -1359 648 -101 15 -459 28 -545 19z
                            m502 -539 c588 -98 1096 -442 1402 -948 127 -211 228 -499 262 -747 16 -118
                            16 -396 0 -510 -26 -192 -106 -451 -191 -620 -195 -390 -546 -730 -936 -911
                            -261 -120 -493 -175 -779 -186 -393 -14 -761 80 -1094 280 -49 29 -95 49 -110
                            49 -14 -1 -172 -48 -351 -105 -179 -57 -326 -103 -328 -102 -1 1 45 142 103
                            314 58 172 105 324 105 339 0 16 -27 67 -66 127 -182 276 -291 602 -313 942
                            -10 141 -2 332 19 448 113 635 508 1161 1085 1448 215 107 431 168 715 201 73
                            9 389 -4 477 -19z"/>
                          <path d="M1825 3785 c-155 -24 -225 -53 -298 -124 -179 -171 -230 -510 -121
                            -799 103 -275 450 -727 738 -961 280 -228 600 -379 966 -456 97 -21 276 -21
                            354 0 149 39 329 168 387 278 53 100 77 313 43 378 -13 25 -54 49 -247 143
                            -128 63 -262 125 -299 140 -122 48 -153 36 -260 -98 -129 -160 -152 -186 -163
                            -186 -5 0 -45 16 -88 34 -163 72 -392 248 -555 429 -70 77 -182 225 -182 239
                            0 5 31 45 68 88 95 109 127 170 125 240 0 46 -17 94 -107 305 -59 138 -119
                            267 -133 288 -46 67 -102 82 -228 62z"/>
                      </g>
                  </svg>
                  <p className="text-center sm:text-start"><strong>Whatsapp:</strong><br/> 0533 949 05 53</p>
              </a>
            <a href="mailto:info@enverfurkanmete.av.tr" className="group min-h-[140px] md:min-h-[180px] flex flex-col sm:flex-row items-center justify-center gap-4 border-1 rounded-md border-gray-300 hover:border-secondary" target="_blank" rel="noopener noreferrer">
                <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
                     width="48" height="48" viewBox="0 0 512.000000 512.000000"
                     preserveAspectRatio="xMidYMid meet">
                    <g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)"
                       stroke="none" className="group-hover:fill-secondary">
                        <path d="M700 4114 c-157 -42 -279 -176 -309 -338 -15 -80 -15 -2230 -1 -2307
                            34 -180 181 -322 360 -350 42 -6 703 -9 1855 -7 l1790 3 56 23 c122 49 211
                            138 262 262 l22 55 3 1125 c2 775 0 1145 -8 1188 -15 90 -56 168 -120 233 -63
                            63 -112 92 -197 114 -86 22 -3629 21 -3713 -1z m3679 -159 c7 -7 -286 -271
                            -896 -810 -499 -440 -912 -801 -919 -803 -12 -3 -1816 1582 -1825 1603 -2 5
                            10 13 26 16 52 11 3603 5 3614 -6z m-3171 -649 c298 -264 541 -485 540 -491
                            -2 -6 -268 -314 -593 -683 -389 -444 -592 -667 -597 -659 -4 6 -8 525 -8 1152
                            0 1115 1 1141 20 1184 l20 43 38 -33 c20 -19 281 -250 580 -513z m3352 474
                            c13 -46 14 -2297 1 -2304 -10 -7 -1186 1327 -1186 1344 0 6 259 239 575 519
                            625 553 587 525 610 441z m-2327 -1379 c153 -135 289 -250 303 -255 15 -6 33
                            -6 49 0 14 5 165 133 336 284 172 151 316 275 320 275 5 0 281 -310 613 -689
                            625 -751 619 -697 537 -724 -48 -17 -3613 -17 -3662 -1 -77 26 -108 -16 546
                            728 l606 692 37 -32 c20 -18 162 -143 315 -278z"/>
                    </g>
                </svg>
                <p className="text-center sm:text-start"><strong>Eposta:</strong><br/> info@enverfurkanmete.av.tr</p>
            </a>
          </div>
          <div className="flex flex-col gap-4 rounded-md overflow-hidden border-1 border-gray-300">
            <div className="w-full aspect-video min-h-[240px] md:min-h-[360px]">
              <iframe
                title="Harita"
                src="https://www.google.com/maps?q=Müftü+Mahallesi+Atatürk+Caddesi+Rize+Adliyesi+Karşısı+No:616/1+Merkez+Rize&output=embed"
                width="100%"
                height="100%"
              ></iframe>
            </div>
            <p className="text-center"><strong>Adres:</strong><br/> Müftü Mahallesi Atatürk Caddesi No:616/1 <br/> (Rize Adliyesi Karşısı) <br/> Merkez/Rize</p>
          </div>
              <form className="flex flex-col gap-4 col-span-1 md:col-span-2 h-full border-1 border-gray-300 rounded-md p-4 items-center">
                  <p className="text-lg mb-6 md:mb-8 text-center">
                      Sorularınız, talepleriniz veya hukuki danışmanlık ihtiyaçlarınız için aşağıdaki formu doldurarak bizimle iletişime geçebilirsiniz.
                  </p>
                  <div className="w-full md:max-w-[400px]">
                      <label htmlFor="name" className="block text-sm font-medium indent-2">Adınız Soyadınız</label>
                      <input type="text" id="name" name="name" required
                             className="indent-2 w-full border-b-1 border-primary focus:outline-none focus:border-secondary" />
                  </div>
                  <div className="w-full md:max-w-[400px]">
                    <label htmlFor="phone" className="block text-sm font-medium indent-2">Telefon</label>
                    <input type="tel" id="phone" name="phone" required pattern="[0-9]{10,15}" placeholder="123 456 78 90"
                             className="indent-2 w-full border-b-1 border-primary focus:outline-none focus:border-secondary" />
                  </div>
                  <div className="w-full md:max-w-[400px]">
                      <label htmlFor="email" className="block text-sm font-medium indent-2">E-posta</label>
                      <input type="email" id="email" name="email" required
                         className="indent-2 w-full border-b-1 border-primary focus:outline-none focus:border-secondary" />
                  </div>
                  <div className="w-full md:max-w-[400px]">
                      <label htmlFor="message" className="block text-sm font-medium indent-2 ">Mesajınız</label>
                      <textarea id="message" name="message" rows={5} required
                                className="indent-2 w-full border-1 border-primary focus:outline-none focus:border-secondary pt-2" />
                  </div>
                  <button type="submit" className="w-full md:max-w-[400px] bg-primary text-white font-semibold py-3 hover:bg-secondary transition-all cursor-pointer">Gönder</button>
              </form>
        </div>

    </div>
  );
}
