# Script to assemble the complete UIU Fall 2026 routine dataset from OCR
import json
import re

# Raw OCR text from the 27 pages provided in official document
ocr_text = """
1 BSCSE ACT 2111 Financial and Managerial Accounting A 301 301 Sat Tue 08:30:AM - 09:50:AM 08:30:AM - 09:50:AM Ishrat Jahan IJ 3
2 BSCSE ACT 2111 Financial and Managerial Accounting B 301 301 Sat Tue 09:51:AM - 11:10:AM 09:51:AM - 11:10:AM Shakila Aziz ShAz 3
3 BSCSE ACT 2111 Financial and Managerial Accounting C 301 301 Sat Tue 11:11:AM - 12:30:PM 11:11:AM - 12:30:PM Ishrat Jahan IJ 3
4 BSCSE ACT 2111 Financial and Managerial Accounting D 302 302 Sat Tue 03:11:PM - 04:30:PM 03:11:PM - 04:30:PM Israt Jabin ItJn 3
5 BSCSE ACT 2111 Financial and Managerial Accounting E 301 301 Sun Wed 11:11:AM - 12:30:PM 11:11:AM - 12:30:PM Ishrat Jahan IJ 3
6 BSCSE ACT 2111 Financial and Managerial Accounting F 301 301 Sun Wed 12:31:PM - 01:50:PM 12:31:PM - 01:50:PM Sadia Binte Anwar SBAr 3
7 BSCSE ACT 2111 Financial and Managerial Accounting G 301 301 Sun Wed 01:51:PM - 03:10:PM 01:51:PM - 03:10:PM Ishrat Jahan IJ 3
8 BSCSE ACT 2111 Financial and Managerial Accounting H 301 301 Sun Wed 03:11:PM - 04:30:PM 03:11:PM - 04:30:PM Ishrat Jahan IJ 3
9 BSCSE ACT 2111 Financial and Managerial Accounting I 301 301 Sat Tue 12:31:PM - 01:50:PM 12:31:PM - 01:50:PM Shakila Aziz ShAz 3
10 BSCSE ACT 2111 Financial and Managerial Accounting J 301 301 Sun Wed 09:51:AM - 11:10:AM 09:51:AM - 11:10:AM Israt Jabin ItJn 3
11 BSCSE ACT 2111 Financial and Managerial Accounting K 302 302 Sun Wed 08:30:AM - 09:50:AM 08:30:AM - 09:50:AM Israt Jabin ItJn 3
12 BSCSE BDS 1201 History of the Emergence of Bangladesh AA 302 302 Sat Tue 08:30:AM - 09:50:AM 08:30:AM - 09:50:AM Mosharof Hossain MfHn 2
13 BSCSE BDS 1201 History of the Emergence of Bangladesh AB 302 302 Sat Tue 09:51:AM - 11:10:AM 09:51:AM - 11:10:AM Mosharof Hossain MfHn 2
14 BSCSE BDS 1201 History of the Emergence of Bangladesh AC 302 302 Sat Tue 12:31:PM - 01:50:PM 12:31:PM - 01:50:PM Mallika Datta MD 2
15 BSCSE BDS 1201 History of the Emergence of Bangladesh AD 302 302 Sun Wed 11:11:AM - 12:30:PM 11:11:AM - 12:30:PM Taniah Mahmuda Tinni TMT 2
16 BSCSE BDS 1201 History of the Emergence of Bangladesh AE (If Required) 302 302 Sun Wed 01:51:PM - 03:10:PM 01:51:PM - 03:10:PM Nabila Sultana NaSa 2
17 BSCSE BIO 3105 Biology for Engineers A 303 303 Sat Tue 08:30:AM - 09:50:AM 08:30:AM - 09:50:AM Erina Sharmin ESh 3
18 BSCSE BIO 3105 Biology for Engineers B 303 303 Sat Tue 09:51:AM - 11:10:AM 09:51:AM - 11:10:AM Erina Sharmin ESh 3
19 BSCSE BIO 3105 Biology for Engineers C 302 302 Sat Tue 11:11:AM - 12:30:PM 11:11:AM - 12:30:PM Sakibul Satter Shupto SaSSh 3
20 BSCSE BIO 3105 Biology for Engineers D 303 303 Sat Tue 12:31:PM - 01:50:PM 12:31:PM - 01:50:PM Md. Sanzed Alam SdAm 3
21 BSCSE BIO 3105 Biology for Engineers E 302 302 Sat Tue 01:51:PM - 03:10:PM 01:51:PM - 03:10:PM Fariha Yousuf Monia FYM 3
22 BSCSE BIO 3105 Biology for Engineers F 303 303 Sat Tue 03:11:PM - 04:30:PM 03:11:PM - 04:30:PM Md. Sanzed Alam SdAm 3
23 BSCSE BIO 3105 Biology for Engineers M 302 302 Sun Wed 03:11:PM - 04:30:PM 03:11:PM - 04:30:PM S.M. Rafiqul Islam SMRI 3
24 BSCSE BIO 3105 Biology for Engineers N 303 303 Sun Wed 03:11:PM - 04:30:PM 03:11:PM - 04:30:PM Md. Zahin Alam MZAm 3
25 BSCSE BIO 3105 Biology for Engineers G 304 304 Sat Tue 03:11:PM - 04:30:PM 03:11:PM - 04:30:PM Fariha Yousuf Monia FYM 3
26 BSCSE BIO 3105 Biology for Engineers H 303 303 Sun Wed 08:30:AM - 09:50:AM 08:30:AM - 09:50:AM M.M. Rafin Mahmud MMRM 3
27 BSCSE BIO 3105 Biology for Engineers I 302 302 Sun Wed 09:51:AM - 11:10:AM 09:51:AM - 11:10:AM Md. Sanzed Alam SdAm 3
28 BSCSE BIO 3105 Biology for Engineers J 303 303 Sun Wed 11:11:AM - 12:30:PM 11:11:AM - 12:30:PM M.M. Rafin Mahmud MMRM 3
29 BSCSE BIO 3105 Biology for Engineers K 302 302 Sun Wed 12:31:PM - 01:50:PM 12:31:PM - 01:50:PM Mobashara Islam MobIm 3
30 BSCSE BIO 3105 Biology for Engineers L 303 303 Sun Wed 01:51:PM - 03:10:PM 01:51:PM - 03:10:PM Sakibul Satter Shupto SaSSh 3
31 BSCSE CSE 1110 Introduction to Computer Systems A 627 (Computer Lab) Sun 11:11:AM - 01:40:PM - Azizur Rahman Anik ARnA 1
32 BSCSE CSE 1110 Introduction to Computer Systems B 726 (Computer Lab) Sun 02:00:PM - 04:30:PM - Md. Tanvir Raihan MTR 1
33 BSCSE CSE 1110 Introduction to Computer Systems C 627 (Computer Lab) Mon 02:00:PM - 04:30:PM - Sayeem Been Zaman SBZ 1
34 BSCSE CSE 1110 Introduction to Computer Systems D 627 (Computer Lab) Sun 08:30:AM - 11:00:AM - Asif Ahmed Utsa AAU 1
35 BSCSE CSE 1110 Introduction to Computer Systems E 326 (Computer Lab) Sun 08:30:AM - 11:00:AM - Mobaswirul Islam MoIsm 1
36 BSCSE CSE 1110 Introduction to Computer Systems F 627 (Computer Lab) Wed 11:11:AM - 01:40:PM - Md. Tanvir Raihan MTR 1
37 BSCSE CSE 1110 Introduction to Computer Systems S 327 (Computer Lab) Sat 08:30:AM - 11:00:AM - Sheikh Mohammed Al Hadi Elaf SMAHE 1
38 BSCSE CSE 1110 Introduction to Computer Systems T 327 (Computer Lab) Sun 08:30:AM - 11:00:AM - Fairoz Anika FzAn 1
39 BSCSE CSE 1110 Introduction to Computer Systems M 627 (Computer Lab) Sat 08:30:AM - 11:00:AM - Md. Muhaiminul Islam Nafi MMIN 1
40 BSCSE CSE 1110 Introduction to Computer Systems N 326 (Computer Lab) Sat 08:30:AM - 11:00:AM - Ms. Sumaiya Ahmed Rani Ms. Sumaiya Ahmed Rani 1
41 BSCSE CSE 1110 Introduction to Computer Systems O 522 (Computer Lab) Tue 11:11:AM - 01:40:PM - Md. Sajjad Hossain MSdHn 1
42 BSCSE CSE 1110 Introduction to Computer Systems P 326 (Computer Lab) Mon 02:00:PM - 04:30:PM - Amit Bin Tariqul ABT 1
43 BSCSE CSE 1110 Introduction to Computer Systems Q 327 (Computer Lab) Tue 02:00:PM - 04:30:PM - Minhajul Bashir MiBa 1
44 BSCSE CSE 1110 Introduction to Computer Systems R 627 (Computer Lab) Tue 08:30:AM - 11:00:AM - Umama Rahman UR 1
45 BSCSE CSE 1110 Introduction to Computer Systems G 627 (Computer Lab) Wed 08:30:AM - 11:00:AM - Asif Ahmed Utsa AAU 1
46 BSCSE CSE 1110 Introduction to Computer Systems H 326 (Computer Lab) Wed 08:30:AM - 11:00:AM - Nusaiba Zaman Manifa NZMa 1
47 BSCSE CSE 1110 Introduction to Computer Systems I 326 (Computer Lab) Wed 11:11:AM - 01:40:PM - Azizur Rahman Anik ARnA 1
48 BSCSE CSE 1110 Introduction to Computer Systems J 522 (Computer Lab) Sat 11:11:AM - 01:40:PM - Minhajul Bashir MiBa 1
49 BSCSE CSE 1110 Introduction to Computer Systems K 627 (Computer Lab) Tue 02:00:PM - 04:30:PM - Amit Bin Tariqul ABT 1
50 BSCSE CSE 1110 Introduction to Computer Systems L 326 (Computer Lab) Tue 02:00:PM - 04:30:PM - Nusaiba Zaman Manifa NZMa 1
51 BSCSE CSE 1111 Structured Programming Language A 304 304 Sat Tue 08:30:AM - 09:50:AM 08:30:AM - 09:50:AM Mohammad Nurul Huda MNH 3
52 BSCSE CSE 1111 Structured Programming Language B 304 304 Sat Tue 09:51:AM - 11:10:AM 09:51:AM - 11:10:AM Anika Tasnim Rodela ATR 3
53 BSCSE CSE 1111 Structured Programming Language C 325 325 Sat Tue 11:11:AM - 12:30:PM 11:11:AM - 12:30:PM Shoib Ahmed Shourav SAhSh 3
54 BSCSE CSE 1111 Structured Programming Language D 325 325 Sat Tue 12:31:PM - 01:50:PM 12:31:PM - 01:50:PM Shoib Ahmed Shourav SAhSh 3
55 BSCSE CSE 1111 Structured Programming Language E 303 303 Sat Tue 01:51:PM - 03:10:PM 01:51:PM - 03:10:PM Hasan Sarwar HS 3
56 BSCSE CSE 1111 Structured Programming Language F (if required) 305 305 Sat Tue 03:11:PM - 04:30:PM 03:11:PM - 04:30:PM TBA TBA 3
57 BSCSE CSE 1111 Structured Programming Language S 304 304 Sun Wed 12:31:PM - 01:50:PM 12:31:PM - 01:50:PM Anika Tasnim Rodela ATR 3
58 BSCSE CSE 1111 Structured Programming Language T 305 305 Sun Wed 01:51:PM - 03:10:PM 01:51:PM - 03:10:PM Samin Sharaf Somik SSSk 3
59 BSCSE CSE 1111 Structured Programming Language U 305 305 Sun Wed 03:11:PM - 04:30:PM 03:11:PM - 04:30:PM Md. Shafqat Talukder MSTR 3
60 BSCSE CSE 1111 Structured Programming Language M 304 304 Sun Wed 11:11:AM - 12:30:PM 11:11:AM - 12:30:PM Sheikh Mohammed Al Hadi Elaf SMAHE 3
61 BSCSE CSE 1111 Structured Programming Language N 303 303 Sun Wed 12:31:PM - 01:50:PM 12:31:PM - 01:50:PM Md. Saiful Azad MdSAd 3
62 BSCSE CSE 1111 Structured Programming Language O 304 304 Sun Wed 01:51:PM - 03:10:PM 01:51:PM - 03:10:PM Sheikh Mohammed Al Hadi Elaf SMAHE 3
63 BSCSE CSE 1111 Structured Programming Language P 304 304 Sun Wed 03:11:PM - 04:30:PM 03:11:PM - 04:30:PM S.M. Kausar Parvej SMKP 3
64 BSCSE CSE 1111 Structured Programming Language Q 305 305 Sun Wed 11:11:AM - 12:30:PM 11:11:AM - 12:30:PM Sajid Ahmed Chowdhury SdACh 3
65 BSCSE CSE 1111 Structured Programming Language R 306 306 Sun Wed 11:11:AM - 12:30:PM 11:11:AM - 12:30:PM Nabila Sabrin Sworna NSS 3
66 BSCSE CSE 1111 Structured Programming Language G 304 304 Sat Tue 11:11:AM - 12:30:PM 11:11:AM - 12:30:PM Sherajul Arifin ShArn 3
67 BSCSE CSE 1111 Structured Programming Language H 305 305 Sat Tue 12:31:PM - 01:50:PM 12:31:PM - 01:50:PM Samin Sharaf Somik SSSk 3
68 BSCSE CSE 1111 Structured Programming Language I 305 305 Sat Tue 11:11:AM - 12:30:PM 11:11:AM - 12:30:PM Nabila Sabrin Sworna NSS 3
69 BSCSE CSE 1111 Structured Programming Language J 304 304 Sat Tue 01:51:PM - 03:10:PM 01:51:PM - 03:10:PM S.M. Kausar Parvej SMKP 3
70 BSCSE CSE 1111 Structured Programming Language K 304 304 Sun Wed 08:30:AM - 09:50:AM 08:30:AM - 09:50:AM Mohammad Nurul Huda MNH 3
71 BSCSE CSE 1111 Structured Programming Language L 303 303 Sun Wed 09:51:AM - 11:10:AM 09:51:AM - 11:10:AM Md. Saiful Azad MdSAd 3
72 BSCSE CSE 1112 Structured Programming Language Laboratory A 422 (Computer Lab) Sat 08:30:AM - 11:00:AM - Md. Taky Shaharair MTSh 1
73 BSCSE CSE 1112 Structured Programming Language Laboratory B 326 (Computer Lab) Sat 11:11:AM - 01:40:PM - Abdullah Ibne Masud Mahi AIMM 1
74 BSCSE CSE 1112 Structured Programming Language Laboratory C 627 (Computer Lab) Sat 02:00:PM - 04:30:PM - Ashraful Islam Paran AIP 1
75 BSCSE CSE 1112 Structured Programming Language Laboratory E 627 (Computer Lab) Mon 11:11:AM - 01:40:PM - Mohmmad Ali MoA 1
76 BSCSE CSE 1112 Structured Programming Language Laboratory F 627 (Computer Lab) Mon 08:30:AM - 11:00:AM - Hamudi Hasan Sonet HHS 1
77 BSCSE CSE 1112 Structured Programming Language Laboratory H 326 (Computer Lab) Sun 11:11:AM - 01:40:PM - Tasriad Ahmed Tias TATs 1
78 BSCSE CSE 1112 Structured Programming Language Laboratory T 327 (Computer Lab) Wed 11:11:AM - 01:40:PM - Sidratul Tanzila Tasmi STT 1
79 BSCSE CSE 1112 Structured Programming Language Laboratory U 522 (Computer Lab) Wed 02:00:PM - 04:30:PM - Sayeem Been Zaman SBZ 1
80 BSCSE CSE 1112 Structured Programming Language Laboratory V 422 (Computer Lab) Wed 08:30:AM - 11:00:AM - Asnuva Tanvin AsTn 1
81 BSCSE CSE 1112 Structured Programming Language Laboratory X 326 (Computer Lab) Wed 02:00:PM - 04:30:PM - Miftahul Sheikh MfSh 1
82 BSCSE CSE 1112 Structured Programming Language Laboratory S 327 (Computer Lab) Wed 08:30:AM - 11:00:AM - Mobaswirul Islam MoIsm 1
83 BSCSE CSE 1112 Structured Programming Language Laboratory N 326 (Computer Lab) Tue 11:11:AM - 01:40:PM - S.M. Kausar Parvej SMKP 1
84 BSCSE CSE 1112 Structured Programming Language Laboratory O 422 (Computer Lab) Tue 02:00:PM - 04:30:PM - Hamudi Hasan Sonet HHS 1
85 BSCSE CSE 1112 Structured Programming Language Laboratory P 326 (Computer Lab) Mon 08:30:AM - 11:00:AM - Miftahul Sheikh MfSh 1
86 BSCSE CSE 1112 Structured Programming Language Laboratory Q 327 (Computer Lab) Tue 11:11:AM - 01:40:PM - Sheikh Mohammed Al Hadi Elaf SMAHE 1
87 BSCSE CSE 1112 Structured Programming Language Laboratory R 327 (Computer Lab) Mon 02:00:PM - 04:30:PM - Mohmmad Ali MoA 1
88 BSCSE CSE 1112 Structured Programming Language Laboratory W 422 (Computer Lab) Wed 11:11:AM - 01:40:PM - Sayeem Been Zaman SBZ 1
89 BSCSE CSE 1112 Structured Programming Language Laboratory I 326 (Computer Lab) Sun 02:00:PM - 04:30:PM - Tasmia Binte Sogir TBS 1
90 BSCSE CSE 1112 Structured Programming Language Laboratory J 423 (Computer Lab) Sun 08:30:AM - 11:00:AM - Saqif Kaisar SaKar 1
91 BSCSE CSE 1112 Structured Programming Language Laboratory K 327 (Computer Lab) Sun 11:11:AM - 01:40:PM - Sidratul Tanzila Tasmi STT 1
92 BSCSE CSE 1112 Structured Programming Language Laboratory G 422 (Computer Lab) Sun 08:30:AM - 11:00:AM - Asnuva Tanvin AsTn 1
93 BSCSE CSE 1112 Structured Programming Language Laboratory L 326 (Computer Lab) Mon 11:11:AM - 01:40:PM - Miftahul Sheikh MfSh 1
94 BSCSE CSE 1112 Structured Programming Language Laboratory M 326 (Computer Lab) Tue 08:30:AM - 11:00:AM - Sajid Ahmed Chowdhury SdACh 1
95 BSCSE CSE 1115 Object Oriented Programming A 305 305 Sat Tue 08:30:AM - 09:50:AM 08:30:AM - 09:50:AM Nusrat Jahan Tithi NtJT 3
96 BSCSE CSE 1115 Object Oriented Programming B 305 305 Sat Tue 09:51:AM - 11:10:AM 09:51:AM - 11:10:AM Nusrat Jahan Tithi NtJT 3
97 BSCSE CSE 1115 Object Oriented Programming C 306 306 Sat Tue 11:11:AM - 12:30:PM 11:11:AM - 12:30:PM Mr. Sheikh Tanvir Ahmed Mr. Sheikh Tanvir Ahmed 3
98 BSCSE CSE 1115 Object Oriented Programming D 306 306 Sat Tue 12:31:PM - 01:50:PM 12:31:PM - 01:50:PM Ashraful Islam Paran AIP 3
99 BSCSE CSE 1115 Object Oriented Programming E 304 304 Sun Wed 09:51:AM - 11:10:AM 09:51:AM - 11:10:AM Mr. Sheikh Tanvir Ahmed Mr. Sheikh Tanvir Ahmed 3
100 BSCSE CSE 1115 Object Oriented Programming F 307 307 Sun Wed 11:11:AM - 12:30:PM 11:11:AM - 12:30:PM Ashraful Islam Paran AIP 3
101 BSCSE CSE 1115 Object Oriented Programming G 305 305 Sun Wed 08:30:AM - 09:50:AM 08:30:AM - 09:50:AM Nusrat Jahan Tithi NtJT 3
102 BSCSE CSE 1115 Object Oriented Programming H 306 306 Sun Wed 01:51:PM - 03:10:PM 01:51:PM - 03:10:PM Ashraful Islam Paran AIP 3
103 BSCSE CSE 1116 Object Oriented Programming Laboratory A 327 (Computer Lab) Mon 11:11:AM - 01:40:PM - Jerin Hasan Priya JHP 1
104 BSCSE CSE 1116 Object Oriented Programming Laboratory B 327 (Computer Lab) Sat 11:11:AM - 01:40:PM - Abrar Mahmud ArMd 1
105 BSCSE CSE 1116 Object Oriented Programming Laboratory C 422 (Computer Lab) Sun 11:11:AM - 01:40:PM - Miftahul Sheikh MfSh 1
106 BSCSE CSE 1116 Object Oriented Programming Laboratory D 327 (Computer Lab) Sun 02:00:PM - 04:30:PM - Mr. Sheikh Tanvir Ahmed Mr. Sheikh Tanvir Ahmed 1
107 BSCSE CSE 1116 Object Oriented Programming Laboratory E 327 (Computer Lab) Tue 08:30:AM - 11:00:AM - Md. Zunaid-Ul-Alam MZUA 1
108 BSCSE CSE 1116 Object Oriented Programming Laboratory F 423 (Computer Lab) Tue 02:00:PM - 04:30:PM - Abrar Mahmud ArMd 1
109 BSCSE CSE 1116 Object Oriented Programming Laboratory G 423 (Computer Lab) Wed 11:11:AM - 01:40:PM - Miftahul Sheikh MfSh 1
110 BSCSE CSE 1116 Object Oriented Programming Laboratory H 327 (Computer Lab) Wed 02:00:PM - 04:30:PM - Mr. Sheikh Tanvir Ahmed Mr. Sheikh Tanvir Ahmed 1
111 BSCSE CSE 1325 Digital Logic Design A 306 306 Sat Tue 08:30:AM - 09:50:AM 08:30:AM - 09:50:AM Mr. Kazi Abid Hasan Mr. Kazi Abid Hasan 3
112 BSCSE CSE 1325 Digital Logic Design B 306 306 Sat Tue 09:51:AM - 11:10:AM 09:51:AM - 11:10:AM Md. Benzir Ahmed MBAd 3
113 BSCSE CSE 1325 Digital Logic Design C 307 307 Sat Tue 11:11:AM - 12:30:PM 11:11:AM - 12:30:PM Md. Iqbal Bahar Chowdhury IBC 3
114 BSCSE CSE 1325 Digital Logic Design D 307 307 Sat Tue 12:31:PM - 01:50:PM 12:31:PM - 01:50:PM Imran Hossain IHn 3
115 BSCSE CSE 1325 Digital Logic Design E 306 306 Sun Wed 08:30:AM - 09:50:AM 08:30:AM - 09:50:AM Mr. Angkon Deb Mr. Angkon Deb 3
116 BSCSE CSE 1325 Digital Logic Design F 305 305 Sun Wed 09:51:AM - 11:10:AM 09:51:AM - 11:10:AM Nusrat Jahan Tithi NtJT 3
117 BSCSE CSE 1325 Digital Logic Design G 308 308 Sun Wed 11:11:AM - 12:30:PM 11:11:AM - 12:30:PM Riasat Azim RtAm 3
118 BSCSE CSE 1326 Digital Logic Design Laboratory A 511 (Digital Lab) Wed 11:11:AM - 01:40:PM - Saqif Kaisar SaKar 1
119 BSCSE CSE 1326 Digital Logic Design Laboratory B 511 (Digital Lab) Sat 11:11:AM - 01:40:PM - Md. Nure-Alam-Dipu NAD 1
120 BSCSE CSE 1326 Digital Logic Design Laboratory C 511 (Digital Lab) Sun 11:11:AM - 01:40:PM - Mr. Angkon Deb Mr. Angkon Deb 1
121 BSCSE CSE 1326 Digital Logic Design Laboratory D 511 (Digital Lab) Sat 08:30:AM - 11:00:AM - S.M. Kausar Parvej SMKP 1
122 BSCSE CSE 1326 Digital Logic Design Laboratory E 511 (Digital Lab) Tue 02:00:PM - 04:30:PM - Mr. Kazi Abid Hasan Mr. Kazi Abid Hasan 1
123 BSCSE CSE 1326 Digital Logic Design Laboratory F 511 (Digital Lab) Sun 02:00:PM - 04:30:PM - Shahriar Mahmud ShMd 1
124 BSCSE CSE 1326 Digital Logic Design Laboratory G 511 (Digital Lab) Wed 02:00:PM - 04:30:PM - Shahriar Mahmud ShMd 1
125 BSCSE CSE 2118 Advanced Object Oriented Programming Laboratory F 422 (Computer Lab) Sat 02:00:PM - 04:30:PM - K M Faizullah Fuhad KMFF 1
126 BSCSE CSE 2118 Advanced Object Oriented Programming Laboratory A 423 (Computer Lab) Sat 08:30:AM - 11:00:AM - Mofiz Mojib Haider MMHr 1
127 BSCSE CSE 2118 Advanced Object Oriented Programming Laboratory B 422 (Computer Lab) Sat 11:11:AM - 01:40:PM - Mofiz Mojib Haider MMHr 1
128 BSCSE CSE 2118 Advanced Object Oriented Programming Laboratory C 327 (Computer Lab) Sat 02:00:PM - 04:30:PM - Kazi Abdun Noor KAN 1
129 BSCSE CSE 2118 Advanced Object Oriented Programming Laboratory D 422 (Computer Lab) Mon 11:11:AM - 01:40:PM - Shahil Yasar Haque SYH 1
130 BSCSE CSE 2118 Advanced Object Oriented Programming Laboratory E 423 (Computer Lab) Mon 11:11:AM - 01:40:PM - Diniya Tahrin Bhuiyan DTB 1
131 BSCSE CSE 2118 Advanced Object Oriented Programming Laboratory G 422 (Computer Lab) Tue 08:30:AM - 11:00:AM - Mahmudul Hasan MahHsn 1
132 BSCSE CSE 2118 Advanced Object Oriented Programming Laboratory H 423 (Computer Lab) Sun 11:11:AM - 01:40:PM - Fazlul Hoque FHoq 1
133 BSCSE CSE 2118 Advanced Object Oriented Programming Laboratory I 424 (Computer Lab) Tue 02:00:PM - 04:30:PM - Mahmudul Hasan MahHsn 1
134 BSCSE CSE 2118 Advanced Object Oriented Programming Laboratory J 422 (Computer Lab) Wed 02:00:PM - 04:30:PM - Diniya Tahrin Bhuiyan DTB 1
135 BSCSE CSE 2118 Advanced Object Oriented Programming Laboratory K 327 (Computer Lab) Mon 08:30:AM - 11:00:AM - Shahil Yasar Haque SYH 1
136 BSCSE CSE 2118 Advanced Object Oriented Programming Laboratory L 422 (Computer Lab) Mon 02:00:PM - 04:30:PM - Diniya Tahrin Bhuiyan DTB 1
137 BSCSE CSE 2213 Discrete Mathematics A 307 307 Sat Tue 08:30:AM - 09:50:AM 08:30:AM - 09:50:AM Kazi Fahim Tahmid KFT 3
138 BSCSE CSE 2213 Discrete Mathematics B 307 307 Sat Tue 09:51:AM - 11:10:AM 09:51:AM - 11:10:AM Md. Shadman Aadeeb MdShA 3
139 BSCSE CSE 2213 Discrete Mathematics C 309 309 Sat Tue 11:11:AM - 12:30:PM 11:11:AM - 12:30:PM Rakibul Hasan Rafi RaHR 3
140 BSCSE CSE 2213 Discrete Mathematics D 309 309 Sat Tue 12:31:PM - 01:50:PM 12:31:PM - 01:50:PM Mr. Masnoon Muztahid Mr. Masnoon Muztahid 3
141 BSCSE CSE 2213 Discrete Mathematics E 305 305 Sat Tue 01:51:PM - 03:10:PM 01:51:PM - 03:10:PM Asnuva Tanvin AsTn 3
142 BSCSE CSE 2213 Discrete Mathematics F 308 308 Sat Tue 08:30:AM - 09:50:AM 08:30:AM - 09:50:AM Saqif Kaisar SaKar 3
143 BSCSE CSE 2213 Discrete Mathematics AK (if required) 307 307 Sun Wed 03:11:PM - 04:30:PM 03:11:PM - 04:30:PM TBA TBA 3
144 BSCSE CSE 2213 Discrete Mathematics AL 308 308 Sun Wed 08:30:AM - 09:50:AM 08:30:AM - 09:50:AM Charles Aunkan Gomes CAG 3
145 BSCSE CSE 2213 Discrete Mathematics AE (if required) 309 309 Sun Wed 11:11:AM - 12:30:PM 11:11:AM - 12:30:PM TBA TBA 3
146 BSCSE CSE 2213 Discrete Mathematics AF 305 305 Sun Wed 12:31:PM - 01:50:PM 12:31:PM - 01:50:PM Didarul Islam Didar DID 3
147 BSCSE CSE 2213 Discrete Mathematics AG 307 307 Sun Wed 01:51:PM - 03:10:PM 01:51:PM - 03:10:PM Sherajul Arifin ShArn 3
148 BSCSE CSE 2213 Discrete Mathematics AH (if required) 306 306 Sun Wed 03:11:PM - 04:30:PM 03:11:PM - 04:30:PM TBA TBA 3
149 BSCSE CSE 2213 Discrete Mathematics AI 306 306 Sun Wed 12:31:PM - 01:50:PM 12:31:PM - 01:50:PM Md. Mehedi Hasan MdMeHn 3
150 BSCSE CSE 2213 Discrete Mathematics AJ 308 308 Sun Wed 01:51:PM - 03:10:PM 01:51:PM - 03:10:PM Rakibul Hasan Rafi RaHR 3
151 BSCSE CSE 2213 Discrete Mathematics Y 306 306 Sat Tue 03:11:PM - 04:30:PM 03:11:PM - 04:30:PM Charles Aunkan Gomes CAG 3
152 BSCSE CSE 2213 Discrete Mathematics Z (if required) 322 322 Sat Tue 08:30:AM - 09:50:AM 08:30:AM - 09:50:AM TBA TBA 3
153 BSCSE CSE 2213 Discrete Mathematics AA 308 308 Sat Tue 11:11:AM - 12:30:PM 11:11:AM - 12:30:PM Asnuva Tanvin AsTn 3
154 BSCSE CSE 2213 Discrete Mathematics AB 307 307 Sat Tue 12:31:PM - 01:50:PM 12:31:PM - 01:50:PM Sayem Shahad SmSd 3
155 BSCSE CSE 2213 Discrete Mathematics AC 306 306 Sun Wed 08:30:AM - 09:50:AM 08:30:AM - 09:50:AM Sherajul Arifin ShArn 3
156 BSCSE CSE 2213 Discrete Mathematics AD 309 309 Sun Wed 09:51:AM - 11:10:AM 09:51:AM - 11:10:AM Didarul Islam Didar DID 3
157 BSCSE CSE 2213 Discrete Mathematics S 308 308 Sun Wed 12:31:PM - 01:50:PM 12:31:PM - 01:50:PM Syed Samin Sadaf SSSf 3
158 BSCSE CSE 2213 Discrete Mathematics T 309 309 Sat Tue 08:30:AM - 09:50:AM 08:30:AM - 09:50:AM Nahin F. Siddiqui NaFS 3
159 BSCSE CSE 2213 Discrete Mathematics U 309 309 Sat Tue 09:51:AM - 11:10:AM 09:51:AM - 11:10:AM Nusaiba Zaman Manifa NZMa 3
160 BSCSE CSE 2213 Discrete Mathematics V 323 323 Sat Tue 11:11:AM - 12:30:PM 11:11:AM - 12:30:PM Md. Muhaiminul Islam Nafi MMIN 3
161 BSCSE CSE 2213 Discrete Mathematics W 323 323 Sat Tue 12:31:PM - 01:50:PM 12:31:PM - 01:50:PM Md. Shadman Aadeeb MdShA 3
162 BSCSE CSE 2213 Discrete Mathematics X 306 306 Sat Tue 01:51:PM - 03:10:PM 01:51:PM - 03:10:PM Abdullah Ibne Masud Mahi AIMM 3
163 BSCSE CSE 2213 Discrete Mathematics M 307 307 Sun Wed 12:31:PM - 01:50:PM 12:31:PM - 01:50:PM Mr. Masnoon Muztahid Mr. Masnoon Muztahid 3
164 BSCSE CSE 2213 Discrete Mathematics N 309 309 Sun Wed 01:51:PM - 03:10:PM 01:51:PM - 03:10:PM S.M. Kausar Parvej SMKP 3
165 BSCSE CSE 2213 Discrete Mathematics O 308 308 Sun Wed 03:11:PM - 04:30:PM 03:11:PM - 04:30:PM Sidratul Tanzila Tasmi STT 3
166 BSCSE CSE 2213 Discrete Mathematics P 322 322 Sun Wed 08:30:AM - 09:50:AM 08:30:AM - 09:50:AM Md. Shadman Aadeeb MdShA 3
167 BSCSE CSE 2213 Discrete Mathematics Q 308 308 Sun Wed 09:51:AM - 11:10:AM 09:51:AM - 11:10:AM Asif Abrar AsAr 3
168 BSCSE CSE 2213 Discrete Mathematics R 323 323 Sun Wed 11:11:AM - 12:30:PM 11:11:AM - 12:30:PM Md. Shadman Aadeeb MdShA 3
169 BSCSE CSE 2213 Discrete Mathematics G 308 308 Sat Tue 09:51:AM - 11:10:AM 09:51:AM - 11:10:AM Humaira Anzum Neha HAN 3
170 BSCSE CSE 2213 Discrete Mathematics H 322 322 Sat Tue 11:11:AM - 12:30:PM 11:11:AM - 12:30:PM Nusaiba Zaman Manifa NZMa 3
171 BSCSE CSE 2213 Discrete Mathematics I 322 322 Sat Tue 12:31:PM - 01:50:PM 12:31:PM - 01:50:PM TBA TBA 3
172 BSCSE CSE 2213 Discrete Mathematics J 309 309 Sun Wed 08:30:AM - 09:50:AM 08:30:AM - 09:50:AM Mr. Masnoon Muztahid Mr. Masnoon Muztahid 3
173 BSCSE CSE 2213 Discrete Mathematics K 307 307 Sun Wed 09:51:AM - 11:10:AM 09:51:AM - 11:10:AM Sidratul Tanzila Tasmi STT 3
174 BSCSE CSE 2213 Discrete Mathematics L 322 322 Sun Wed 11:11:AM - 12:30:PM 11:11:AM - 12:30:PM Md. Mehedi Hasan MdMeHn 3
175 BSCSE CSE 2215 Data Structure and Algorithms I A 323 323 Sat Tue 08:30:AM - 09:50:AM 08:30:AM - 09:50:AM Anika Tasnim Rodela ATR 3
176 BSCSE CSE 2215 Data Structure and Algorithms I B 322 322 Sat Tue 09:51:AM - 11:10:AM 09:51:AM - 11:10:AM Md. Saiful Azad MdSAd 3
177 BSCSE CSE 2215 Data Structure and Algorithms I C 324 324 Sat Tue 11:11:AM - 12:30:PM 11:11:AM - 12:30:PM Mohammad Nurul Huda MNH 3
178 BSCSE CSE 2215 Data Structure and Algorithms I D 324 324 Sat Tue 12:31:PM - 01:50:PM 12:31:PM - 01:50:PM Md. Saiful Azad MdSAd 3
179 BSCSE CSE 2215 Data Structure and Algorithms I E 307 307 Sat Tue 01:51:PM - 03:10:PM 01:51:PM - 03:10:PM Mr. Mabsur Fatin Bin Hossain Mr. Mabsur Fatin Bin Hossain 3
180 BSCSE CSE 2215 Data Structure and Algorithms I F 323 323 Sun Wed 08:30:AM - 09:50:AM 08:30:AM - 09:50:AM Rubaiya Rahtin Khan RRK 3
181 BSCSE CSE 2215 Data Structure and Algorithms I G 309 309 Sun Wed 09:51:AM - 11:10:AM 09:51:AM - 11:10:AM Anika Tasnim Rodela ATR 3
182 BSCSE CSE 2215 Data Structure and Algorithms I H 329 329 Sun Wed 11:11:AM - 12:30:PM 11:11:AM - 12:30:PM Rubaiya Rahtin Khan RRK 3
183 BSCSE CSE 2215 Data Structure and Algorithms I I 309 309 Sun Wed 12:31:PM - 01:50:PM 12:31:PM - 01:50:PM Md. Zunaid-Ul-Alam MZUA 3
184 BSCSE CSE 2215 Data Structure and Algorithms I K 309 309 Sun Wed 03:11:PM - 04:30:PM 03:11:PM - 04:30:PM Md. Zunaid-Ul-Alam MZUA 3
185 BSCSE CSE 2215 Data Structure and Algorithms I J 322 322 Sun Wed 01:51:PM - 03:10:PM 01:51:PM - 03:10:PM Abu Bakar Fahad ABF 3
186 BSCSE CSE 2216 Data Structure and Algorithms I Laboratory A 424 (Computer Lab) Sat 08:30:AM - 11:00:AM - Md. Sajjad Hossain MSdHn 1
187 BSCSE CSE 2216 Data Structure and Algorithms I Laboratory B 423 (Computer Lab) Sat 11:11:AM - 01:40:PM - Pranta Biswas PB 1
188 BSCSE CSE 2216 Data Structure and Algorithms I Laboratory C 423 (Computer Lab) Sat 02:00:PM - 04:30:PM - Sherajul Arifin ShArn 1
189 BSCSE CSE 2216 Data Structure and Algorithms I Laboratory D 424 (Computer Lab) Wed 11:11:AM - 01:40:PM - Hafijul Hoque Chowdhury HHCh 1
190 BSCSE CSE 2216 Data Structure and Algorithms I Laboratory E 424 (Computer Lab) Sun 11:11:AM - 01:40:PM - Hafijul Hoque Chowdhury HHCh 1
191 BSCSE CSE 2216 Data Structure and Algorithms I Laboratory F 422 (Computer Lab) Sun 02:00:PM - 04:30:PM - Charles Aunkan Gomes CAG 1
192 BSCSE CSE 2216 Data Structure and Algorithms I Laboratory G 422 (Computer Lab) Mon 08:30:AM - 11:00:AM - Sayeem Been Zaman SBZ 1
193 BSCSE CSE 2216 Data Structure and Algorithms I Laboratory H 424 (Computer Lab) Mon 11:11:AM - 01:40:PM - Sayeem Been Zaman SBZ 1
194 BSCSE CSE 2216 Data Structure and Algorithms I Laboratory I 423 (Computer Lab) Tue 08:30:AM - 11:00:AM - Sherajul Arifin ShArn 1
195 BSCSE CSE 2216 Data Structure and Algorithms I Laboratory J 422 (Computer Lab) Tue 11:11:AM - 01:40:PM - Pranta Biswas PB 1
196 BSCSE CSE 2216 Data Structure and Algorithms I Laboratory K 423 (Computer Lab) Wed 02:00:PM - 04:30:PM - Charles Aunkan Gomes CAG 1
197 BSCSE CSE 2216 Data Structure and Algorithms I Laboratory L 827 (Computer Lab) Wed 11:11:AM - 01:40:PM - Abu Bakar Fahad ABF 1
198 BSCSE CSE 2217 Data Structure and Algorithms II A 324 324 Sat Tue 08:30:AM - 09:50:AM 08:30:AM - 09:50:AM Fairoz Anika FzAn 3
199 BSCSE CSE 2217 Data Structure and Algorithms II B 323 323 Sat Tue 09:51:AM - 11:10:AM 09:51:AM - 11:10:AM Md. Tarek Hasan MdTH 3
200 BSCSE CSE 2217 Data Structure and Algorithms II C 303 303 Sat Tue 11:11:AM - 12:30:PM 11:11:AM - 12:30:PM Ms. Mehreen Hossain Chowdhury Ms. Mehreen Hossain Chowdhury 3
201 BSCSE CSE 2217 Data Structure and Algorithms II D 304 304 Sat Tue 12:31:PM - 01:50:PM 12:31:PM - 01:50:PM Md. Tarek Hasan MdTH 3
202 BSCSE CSE 2217 Data Structure and Algorithms II E 308 308 Sat Tue 01:51:PM - 03:10:PM 01:51:PM - 03:10:PM Ms. Sumaiya Ahmed Rani Ms. Sumaiya Ahmed Rani 3
203 BSCSE CSE 2217 Data Structure and Algorithms II F 308 308 Sat Tue 03:11:PM - 04:30:PM 03:11:PM - 04:30:PM Mr. Sheikh Tanvir Ahmed Mr. Sheikh Tanvir Ahmed 3
204 BSCSE CSE 2217 Data Structure and Algorithms II I 325 325 Sun Wed 11:11:AM - 12:30:PM 11:11:AM - 12:30:PM Fairoz Anika FzAn 3
205 BSCSE CSE 2217 Data Structure and Algorithms II J 322 322 Sun Wed 12:31:PM - 01:50:PM 12:31:PM - 01:50:PM Md. Tarek Hasan MdTH 3
206 BSCSE CSE 2217 Data Structure and Algorithms II K 323 323 Sun Wed 01:51:PM - 03:10:PM 01:51:PM - 03:10:PM Fairoz Anika FzAn 3
207 BSCSE CSE 2217 Data Structure and Algorithms II L 322 322 Sun Wed 03:11:PM - 04:30:PM 03:11:PM - 04:30:PM Anindya Hoque AnHq 3
208 BSCSE CSE 2217 Data Structure and Algorithms II G 324 324 Sun Wed 08:30:AM - 09:50:AM 08:30:AM - 09:50:AM Ms. Sumaiya Ahmed Rani Ms. Sumaiya Ahmed Rani 3
209 BSCSE CSE 2217 Data Structure and Algorithms II H 322 322 Sun Wed 09:51:AM - 11:10:AM 09:51:AM - 11:10:AM Md. Tarek Hasan MdTH 3
210 BSCSE CSE 2218 Data Structure and Algorithms II Laboratory P 523 (Computer Lab) Wed 11:11:AM - 01:40:PM - Humaira Anzum Neha HAN 1
211 BSCSE CSE 2218 Data Structure and Algorithms II Laboratory Q 424 (Computer Lab) Wed 02:00:PM - 04:30:PM - Tasmia Binte Sogir TBS 1
212 BSCSE CSE 2218 Data Structure and Algorithms II Laboratory A 927 (Computer Lab) Sat 08:30:AM - 11:00:AM - Anindya Hoque AnHq 1
213 BSCSE CSE 2218 Data Structure and Algorithms II Laboratory B 424 (Computer Lab) Sat 11:11:AM - 01:40:PM - Asif Abrar AsAr 1
214 BSCSE CSE 2218 Data Structure and Algorithms II Laboratory C 424 (Computer Lab) Sat 02:00:PM - 04:30:PM - Rizvan Jawad Ruhan RJR 1
215 BSCSE CSE 2218 Data Structure and Algorithms II Laboratory D 427 (Computer Lab) Wed 11:11:AM - 01:40:PM - Anindya Hoque AnHq 1
216 BSCSE CSE 2218 Data Structure and Algorithms II Laboratory L 423 (Computer Lab) Tue 11:11:AM - 01:40:PM - Tasmia Binte Sogir TBS 1
217 BSCSE CSE 2218 Data Structure and Algorithms II Laboratory M 426 (Computer Lab) Tue 02:00:PM - 04:30:PM - Rizvan Jawad Ruhan RJR 1
218 BSCSE CSE 2218 Data Structure and Algorithms II Laboratory N 424 (Computer Lab) Tue 11:11:AM - 01:40:PM - Asif Abrar AsAr 1
219 BSCSE CSE 2218 Data Structure and Algorithms II Laboratory O 423 (Computer Lab) Wed 08:30:AM - 11:00:AM - Diniya Tahrin Bhuiyan DTB 1
220 BSCSE CSE 2218 Data Structure and Algorithms II Laboratory F 827 (Computer Lab) Sun 11:11:AM - 01:40:PM - Humaira Anzum Neha HAN 1
221 BSCSE CSE 2218 Data Structure and Algorithms II Laboratory E 424 (Computer Lab) Sun 08:30:AM - 11:00:AM - Sayem Shahad SmSd 1
222 BSCSE CSE 2218 Data Structure and Algorithms II Laboratory G 423 (Computer Lab) Mon 02:00:PM - 04:30:PM - Md. Enamul Haque MEHq 1
223 BSCSE CSE 2218 Data Structure and Algorithms II Laboratory H 626 (Computer Lab) Sun 11:11:AM - 01:40:PM - Ms. Sumaiya Ahmed Rani Ms. Sumaiya Ahmed Rani 1
224 BSCSE CSE 2218 Data Structure and Algorithms II Laboratory I 424 (Computer Lab) Mon 02:00:PM - 04:30:PM - Raiyan Janik Monir RJM 1
225 BSCSE CSE 2218 Data Structure and Algorithms II Laboratory J 426 (Computer Lab) Mon 11:11:AM - 01:40:PM - Raiyan Janik Monir RJM 1
226 BSCSE CSE 2218 Data Structure and Algorithms II Laboratory K 424 (Computer Lab) Tue 08:30:AM - 11:00:AM - Sayem Shahad SmSd 1
227 BSCSE CSE 2233 Theory of Computation A 325 325 Sat Tue 08:30:AM - 09:50:AM 08:30:AM - 09:50:AM Asif Ahmed Utsa AAU 3
228 BSCSE CSE 2233 Theory of Computation B 328 328 Sat Tue 11:11:AM - 12:30:PM 11:11:AM - 12:30:PM Md. Muhyminul Haque MdMH 3
229 BSCSE CSE 2233 Theory of Computation C 309 309 Sat Tue 01:51:PM - 03:10:PM 01:51:PM - 03:10:PM Asif Ahmed Utsa AAU 3
230 BSCSE CSE 2233 Theory of Computation D 323 323 Sun Wed 09:51:AM - 11:10:AM 09:51:AM - 11:10:AM Md. Muhyminul Haque MdMH 3
231 BSCSE CSE 2233 Theory of Computation E 328 328 Sun Wed 11:11:AM - 12:30:PM 11:11:AM - 12:30:PM Asif Ahmed Utsa AAU 3
232 BSCSE CSE 2233 Theory of Computation F 323 323 Sun Wed 12:31:PM - 01:50:PM 12:31:PM - 01:50:PM Ms. Mehreen Hossain Chowdhury Ms. Mehreen Hossain Chowdhury 3
233 BSCSE CSE 2233 Theory of Computation G 323 323 Sun Wed 03:11:PM - 04:30:PM 03:11:PM - 04:30:PM Ms. Mehreen Hossain Chowdhury Ms. Mehreen Hossain Chowdhury 3
234 BSCSE CSE 3313 Computer Architecture A 328 328 Sat Tue 08:30:AM - 09:50:AM 08:30:AM - 09:50:AM Tasmin Sanjida TaSa 3
235 BSCSE CSE 3313 Computer Architecture B 324 324 Sat Tue 09:51:AM - 11:10:AM 09:51:AM - 11:10:AM Sidratul Tanzila Tasmi STT 3
236 BSCSE CSE 3313 Computer Architecture C 329 329 Sat Tue 11:11:AM - 12:30:PM 11:11:AM - 12:30:PM Tasmin Sanjida TaSa 3
237 BSCSE CSE 3313 Computer Architecture D 328 328 Sat Tue 12:31:PM - 01:50:PM 12:31:PM - 01:50:PM Humaira Anzum Neha HAN 3
238 BSCSE CSE 3313 Computer Architecture E 322 322 Sat Tue 01:51:PM - 03:10:PM 01:51:PM - 03:10:PM Sidratul Tanzila Tasmi STT 3
239 BSCSE CSE 3313 Computer Architecture F 309 309 Sat Tue 03:11:PM - 04:30:PM 03:11:PM - 04:30:PM TBA TBA 3
240 BSCSE CSE 3313 Computer Architecture G 325 325 Sun Wed 08:30:AM - 09:50:AM 08:30:AM - 09:50:AM Humaira Anzum Neha HAN 3
241 BSCSE CSE 3313 Computer Architecture H 324 324 Sun Wed 09:51:AM - 11:10:AM 09:51:AM - 11:10:AM Humaira Anzum Neha HAN 3
242 BSCSE CSE 3313 Computer Architecture I 324 324 Sun Wed 11:11:AM - 12:30:PM 11:11:AM - 12:30:PM Shoib Ahmed Shourav SAhSh 3
243 BSCSE CSE 3313 Computer Architecture J 324 324 Sun Wed 12:31:PM - 01:50:PM 12:31:PM - 01:50:PM Shoib Ahmed Shourav SAhSh 3
244 BSCSE CSE 3313 Computer Architecture K 324 324 Sun Wed 01:51:PM - 03:10:PM 01:51:PM - 03:10:PM TBA TBA 3
245 BSCSE CSE 3313 Computer Architecture L 324 324 Sun Wed 03:11:PM - 04:30:PM 03:11:PM - 04:30:PM TBA TBA 3
246 BSCSE CSE 3411 System Analysis and Design A 329 329 Sat Tue 08:30:AM - 09:50:AM 08:30:AM - 09:50:AM Syed Samin Sadaf SSSf 3
247 BSCSE CSE 3411 System Analysis and Design B 325 325 Sat Tue 09:51:AM - 11:10:AM 09:51:AM - 11:10:AM Md. Romizul Islam MdRIm 3
248 BSCSE CSE 3411 System Analysis and Design C 330 330 Sat Tue 11:11:AM - 12:30:PM 11:11:AM - 12:30:PM Tasriad Ahmed Tias TATs 3
249 BSCSE CSE 3411 System Analysis and Design D 329 329 Sat Tue 12:31:PM - 01:50:PM 12:31:PM - 01:50:PM Suman Ahmmed SA 3
250 BSCSE CSE 3411 System Analysis and Design E 323 323 Sat Tue 01:51:PM - 03:10:PM 01:51:PM - 03:10:PM Sidratul Muntaha SiMa 3
251 BSCSE CSE 3411 System Analysis and Design F 322 322 Sat Tue 03:11:PM - 04:30:PM 03:11:PM - 04:30:PM Tasmin Sanjida TaSa 3
252 BSCSE CSE 3411 System Analysis and Design M 325 325 Sun Wed 03:11:PM - 04:30:PM 03:11:PM - 04:30:PM Md. Taky Shaharair MTSh 3
253 BSCSE CSE 3411 System Analysis and Design N 328 328 Sun Wed 01:51:PM - 03:10:PM 01:51:PM - 03:10:PM TBA TBA 3
254 BSCSE CSE 3411 System Analysis and Design G 328 328 Sat Tue 09:51:AM - 11:10:AM 09:51:AM - 11:10:AM Asnuva Tanvin AsTn 3
255 BSCSE CSE 3411 System Analysis and Design H 328 328 Sun Wed 08:30:AM - 09:50:AM 08:30:AM - 09:50:AM Tasriad Ahmed Tias TATs 3
256 BSCSE CSE 3411 System Analysis and Design I 325 325 Sun Wed 09:51:AM - 11:10:AM 09:51:AM - 11:10:AM Sidratul Muntaha SiMa 3
257 BSCSE CSE 3411 System Analysis and Design J 330 330 Sun Wed 11:11:AM - 12:30:PM 11:11:AM - 12:30:PM Sidratul Muntaha SiMa 3
258 BSCSE CSE 3411 System Analysis and Design K 325 325 Sun Wed 12:31:PM - 01:50:PM 12:31:PM - 01:50:PM Shahriar Mahmud ShMd 3
259 BSCSE CSE 3411 System Analysis and Design L 325 325 Sun Wed 01:51:PM - 03:10:PM 01:51:PM - 03:10:PM Tasmin Sanjida TaSa 3
260 BSCSE CSE 3412 System Analysis and Design Laboratory A 523 (Computer Lab) Sat 08:30:AM - 11:00:AM - Sayeem Been Zaman SBZ 1
261 BSCSE CSE 3412 System Analysis and Design Laboratory B 426 (Computer Lab) Sat 11:11:AM - 01:40:PM - Rejwan Ahmed ReAd 1
262 BSCSE CSE 3412 System Analysis and Design Laboratory C 426 (Computer Lab) Sat 02:00:PM - 04:30:PM - Emrul Kayes Raceme EKR 1
263 BSCSE CSE 3412 System Analysis and Design Laboratory D 427 (Computer Lab) Sat 02:00:PM - 04:30:PM - Md. Kamruzzaman MdK 1
264 BSCSE CSE 3412 System Analysis and Design Laboratory E 424 (Computer Lab) Wed 08:30:AM - 11:00:AM - Shahil Yasar Haque SYH 1
265 BSCSE CSE 3412 System Analysis and Design Laboratory F 326 (Computer Lab) Sat 02:00:PM - 04:30:PM - Md. Mainul Islam MMaIm 1
266 BSCSE CSE 3412 System Analysis and Design Laboratory M 426 (Computer Lab) Wed 08:30:AM - 11:00:AM - Tasmin Sanjida TaSa 1
267 BSCSE CSE 3412 System Analysis and Design Laboratory N 528 (Computer Lab) Wed 11:11:AM - 01:40:PM - Shahil Yasar Haque SYH 1
268 BSCSE CSE 3412 System Analysis and Design Laboratory O 426 (Computer Lab) Wed 02:00:PM - 04:30:PM - Sidratul Muntaha SiMa 1
269 BSCSE CSE 3412 System Analysis and Design Laboratory G 426 (Computer Lab) Sun 08:30:AM - 11:00:AM - Tasmin Sanjida TaSa 1
270 BSCSE CSE 3412 System Analysis and Design Laboratory H 523 (Computer Lab) Sun 11:11:AM - 01:40:PM - Zobaer Ibn Razzaque ZIR 1
271 BSCSE CSE 3412 System Analysis and Design Laboratory I 423 (Computer Lab) Sun 02:00:PM - 04:30:PM - Shahil Yasar Haque SYH 1
272 BSCSE CSE 3412 System Analysis and Design Laboratory J 426 (Computer Lab) Tue 08:30:AM - 11:00:AM - Sayeem Been Zaman SBZ 1
273 BSCSE CSE 3412 System Analysis and Design Laboratory K 426 (Computer Lab) Tue 11:11:AM - 01:40:PM - Sidratul Muntaha SiMa 1
274 BSCSE CSE 3412 System Analysis and Design Laboratory L 427 (Computer Lab) Tue 02:00:PM - 04:30:PM - Sayeem Been Zaman SBZ 1
275 BSCSE CSE 3421 Software Engineering A 330 330 Sat Tue 08:30:AM - 09:50:AM 08:30:AM - 09:50:AM Samin Sharaf Somik SSSk 3
276 BSCSE CSE 3421 Software Engineering B 401 401 Sat Tue 11:11:AM - 12:30:PM 11:11:AM - 12:30:PM Md. Benzir Ahmed MBAd 3
277 BSCSE CSE 3421 Software Engineering C 330 330 Sat Tue 12:31:PM - 01:50:PM 12:31:PM - 01:50:PM Mr. Sheikh Mostofa Amir Foisol Mr. Sheikh Mostofa Amir Foisol 3
278 BSCSE CSE 3421 Software Engineering D 324 324 Sat Tue 01:51:PM - 03:10:PM 01:51:PM - 03:10:PM Md. Benzir Ahmed MBAd 3
279 BSCSE CSE 3421 Software Engineering E 329 329 Sun Wed 08:30:AM - 09:50:AM 08:30:AM - 09:50:AM Md. Muhaiminul Islam Nafi MMIN 3
280 BSCSE CSE 3421 Software Engineering F 328 328 Sun Wed 09:51:AM - 11:10:AM 09:51:AM - 11:10:AM Md. Muhaiminul Islam Nafi MMIN 3
281 BSCSE CSE 3421 Software Engineering G 401 401 Sun Wed 11:11:AM - 12:30:PM 11:11:AM - 12:30:PM Sherajul Arifin ShArn 3
282 BSCSE CSE 3421 Software Engineering H 328 328 Sun Wed 12:31:PM - 01:50:PM 12:31:PM - 01:50:PM Abrar Mahmud ArMd 3
283 BSCSE CSE 3421 Software Engineering I 329 329 Sun Wed 01:51:PM - 03:10:PM 01:51:PM - 03:10:PM Md. Muhaiminul Islam Nafi MMIN 3
284 BSCSE CSE 3421 Software Engineering J 328 328 Sun Wed 03:11:PM - 04:30:PM 03:11:PM - 04:30:PM Md. Anowarul Abedin MAnAn 3
285 BSCSE CSE 3421 Software Engineering K 329 329 Sat Tue 09:51:AM - 11:10:AM 09:51:AM - 11:10:AM Mr. Sheikh Mostofa Amir Foisol Mr. Sheikh Mostofa Amir Foisol 3
286 BSCSE CSE 3421 Software Engineering L 323 323 Sat Tue 03:11:PM - 04:30:PM 03:11:PM - 04:30:PM Sajid Ahmed Chowdhury SdACh 3
287 BSCSE CSE 3422 Software Engineering Laboratory A 528 (Computer Lab) Sat 08:30:AM - 11:00:AM - Md. Foysal Ahamed MFAd 1
288 BSCSE CSE 3422 Software Engineering Laboratory B 427 (Computer Lab) Sat 11:11:AM - 01:40:PM - TBA TBA 1
289 BSCSE CSE 3422 Software Engineering Laboratory C 528 (Computer Lab) Sat 02:00:PM - 04:30:PM - Md. Foysal Ahamed MFAd 1
290 BSCSE CSE 3422 Software Engineering Laboratory D 523 (Computer Lab) Sat 11:11:AM - 01:40:PM - Saifullah Mahbub SaMb 1
291 BSCSE CSE 3422 Software Engineering Laboratory E 427 (Computer Lab) Sun 08:30:AM - 11:00:AM - Zobaer Ibn Razzaque ZIR 1
292 BSCSE CSE 3422 Software Engineering Laboratory F 528 (Computer Lab) Sun 11:11:AM - 01:40:PM - Sajjad Ahmed SdAh 1
293 BSCSE CSE 3422 Software Engineering Laboratory M 427 (Computer Lab) Wed 08:30:AM - 11:00:AM - Mr. Sheikh Mostofa Amir Foisol Mr. Sheikh Mostofa Amir Foisol 1
294 BSCSE CSE 3422 Software Engineering Laboratory N 529 (Computer Lab) Wed 11:11:AM - 01:40:PM - Tasriad Ahmed Tias TATs 1
295 BSCSE CSE 3422 Software Engineering Laboratory O 427 (Computer Lab) Wed 02:00:PM - 04:30:PM - Mr. Sheikh Mostofa Amir Foisol Mr. Sheikh Mostofa Amir Foisol 1
296 BSCSE CSE 3422 Software Engineering Laboratory G 424 (Computer Lab) Sun 02:00:PM - 04:30:PM - Sajid Ahmed Chowdhury SdACh 1
297 BSCSE CSE 3422 Software Engineering Laboratory H 528 (Computer Lab) Sat 11:11:AM - 01:40:PM - Mohammad Johirul Islam MdJI 1
298 BSCSE CSE 3422 Software Engineering Laboratory I 427 (Computer Lab) Tue 08:30:AM - 11:00:AM - Md. Muhaiminul Islam Nafi MMIN 1
299 BSCSE CSE 3422 Software Engineering Laboratory J 427 (Computer Lab) Tue 11:11:AM - 01:40:PM - Sajid Ahmed Chowdhury SdACh 1
300 BSCSE CSE 3422 Software Engineering Laboratory K 523 (Computer Lab) Tue 02:00:PM - 04:30:PM - Ashraful Islam Paran AIP 1
301 BSCSE CSE 3422 Software Engineering Laboratory L 423 (Computer Lab) Mon 08:30:AM - 11:00:AM - Raiyan Janik Monir RJM 1
302 BSCSE CSE 3521 Database Management Systems A 401 401 Sat Tue 08:30:AM - 09:50:AM 08:30:AM - 09:50:AM Didarul Islam Didar DID 3
303 BSCSE CSE 3521 Database Management Systems B 330 330 Sat Tue 09:51:AM - 11:10:AM 09:51:AM - 11:10:AM Mobaswirul Islam MoIsm 3
304 BSCSE CSE 3521 Database Management Systems C 402 402 Sat Tue 11:11:AM - 12:30:PM 11:11:AM - 12:30:PM Md. Shafqat Talukder MSTR 3
305 BSCSE CSE 3521 Database Management Systems D 401 401 Sat Tue 12:31:PM - 01:50:PM 12:31:PM - 01:50:PM Anindya Hoque AnHq 3
306 BSCSE CSE 3521 Database Management Systems E 325 325 Sat Tue 01:51:PM - 03:10:PM 01:51:PM - 03:10:PM Didarul Islam Didar DID 3
307 BSCSE CSE 3521 Database Management Systems F 324 324 Sat Tue 03:11:PM - 04:30:PM 03:11:PM - 04:30:PM Tanmoy Bipro Das TBD 3
308 BSCSE CSE 3521 Database Management Systems G 330 330 Sun Wed 08:30:AM - 09:50:AM 08:30:AM - 09:50:AM Abrar Mahmud ArMd 3
309 BSCSE CSE 3521 Database Management Systems H 329 329 Sun Wed 09:51:AM - 11:10:AM 09:51:AM - 11:10:AM Md. Shafqat Talukder MSTR 3
310 BSCSE CSE 3521 Database Management Systems I 402 402 Sun Wed 11:11:AM - 12:30:PM 11:11:AM - 12:30:PM Md. Shafqat Talukder MSTR 3
311 BSCSE CSE 3521 Database Management Systems J 329 329 Sun Wed 12:31:PM - 01:50:PM 12:31:PM - 01:50:PM Md. Shafqat Talukder MSTR 3
312 BSCSE CSE 3521 Database Management Systems K 330 330 Sun Wed 01:51:PM - 03:10:PM 01:51:PM - 03:10:PM Farhan Anan Himu FAH 3
313 BSCSE CSE 3521 Database Management Systems L 329 329 Sun Wed 03:11:PM - 04:30:PM 03:11:PM - 04:30:PM Abrar Mahmud ArMd 3
314 BSCSE CSE 3522 Database Management Systems Laboratory A 529 (Computer Lab) Sat 08:30:AM - 11:00:AM - Mohammad Johirul Islam MdJI 1
315 BSCSE CSE 3522 Database Management Systems Laboratory B 529 (Computer Lab) Sat 11:11:AM - 01:40:PM - Zobaer Ibn Razzaque ZIR 1
316 BSCSE CSE 3522 Database Management Systems Laboratory C 529 (Computer Lab) Sat 02:00:PM - 04:30:PM - Md. Golam Hossain MGH 1
317 BSCSE CSE 3522 Database Management Systems Laboratory D 530 (Computer Lab) Sat 02:00:PM - 04:30:PM - Zobaer Ibn Razzaque ZIR 1
318 BSCSE CSE 3522 Database Management Systems Laboratory E 530 (Computer Lab) Sat 11:11:AM - 01:40:PM - Md. Golam Hossain MGH 1
319 BSCSE CSE 3522 Database Management Systems Laboratory F 727 (Computer Lab) Sat 02:00:PM - 04:30:PM - Saifullah Mahbub SaMb 1
320 BSCSE CSE 3522 Database Management Systems Laboratory M 528 (Computer Lab) Tue 02:00:PM - 04:30:PM - Jerin Hasan Priya JHP 1
321 BSCSE CSE 3522 Database Management Systems Laboratory N 427 (Computer Lab) Mon 11:11:AM - 01:40:PM - Md. Enamul Haque MEHq 1
322 BSCSE CSE 3522 Database Management Systems Laboratory O 523 (Computer Lab) Wed 08:30:AM - 11:00:AM - Abu Bakar Fahad ABF 1
323 BSCSE CSE 3522 Database Management Systems Laboratory P 426 (Computer Lab) Mon 02:00:PM - 04:30:PM - Abu Bakar Fahad ABF 1
324 BSCSE CSE 3522 Database Management Systems Laboratory G 523 (Computer Lab) Sun 08:30:AM - 11:00:AM - Ms. Mehreen Hossain Chowdhury Ms. Mehreen Hossain Chowdhury 1
325 BSCSE CSE 3522 Database Management Systems Laboratory H 529 (Computer Lab) Sun 11:11:AM - 01:40:PM - Abu Bakar Fahad ABF 1
326 BSCSE CSE 3522 Database Management Systems Laboratory I 523 (Computer Lab) Wed 02:00:PM - 04:30:PM - Jerin Hasan Priya JHP 1
327 BSCSE CSE 3522 Database Management Systems Laboratory J 424 (Computer Lab) Mon 08:30:AM - 11:00:AM - Md. Enamul Haque MEHq 1
328 BSCSE CSE 3522 Database Management Systems Laboratory K 523 (Computer Lab) Tue 08:30:AM - 11:00:AM - Md. Enamul Haque MEHq 1
329 BSCSE CSE 3522 Database Management Systems Laboratory L 523 (Computer Lab) Tue 11:11:AM - 01:40:PM - Miftahul Sheikh MfSh 1
330 BSCSE CSE 3711 Computer Networks A 402 402 Sat Tue 08:30:AM - 09:50:AM 08:30:AM - 09:50:AM Zaara Zabeen Arpa ZZA 3
331 BSCSE CSE 3711 Computer Networks B 401 401 Sat Tue 09:51:AM - 11:10:AM 09:51:AM - 11:10:AM Saqif Kaisar SaKar 3
332 BSCSE CSE 3711 Computer Networks C 403 403 Sat Tue 11:11:AM - 12:30:PM 11:11:AM - 12:30:PM Zaara Zabeen Arpa ZZA 3
333 BSCSE CSE 3711 Computer Networks D 402 402 Sat Tue 12:31:PM - 01:50:PM 12:31:PM - 01:50:PM Muhammad Nomani Kabir MNK 3
334 BSCSE CSE 3711 Computer Networks E 328 328 Sat Tue 01:51:PM - 03:10:PM 01:51:PM - 03:10:PM Muhammad Nomani Kabir MNK 3
335 BSCSE CSE 3711 Computer Networks F 401 401 Sun Wed 08:30:AM - 09:50:AM 08:30:AM - 09:50:AM Abdullah Ibne Masud Mahi AIMM 3
336 BSCSE CSE 3711 Computer Networks G 330 330 Sun Wed 09:51:AM - 11:10:AM 09:51:AM - 11:10:AM Mohammad Mamun Elahi ME 3
337 BSCSE CSE 3711 Computer Networks H 403 403 Sun Wed 11:11:AM - 12:30:PM 11:11:AM - 12:30:PM Mohammad Mamun Elahi ME 3
338 BSCSE CSE 3711 Computer Networks I 330 330 Sun Wed 12:31:PM - 01:50:PM 12:31:PM - 01:50:PM Zaara Zabeen Arpa ZZA 3
339 BSCSE CSE 3711 Computer Networks J 401 401 Sun Wed 01:51:PM - 03:10:PM 01:51:PM - 03:10:PM Abdullah Ibne Masud Mahi AIMM 3
340 BSCSE CSE 3711 Computer Networks K 330 330 Sun Wed 03:11:PM - 04:30:PM 03:11:PM - 04:30:PM Pranta Biswas PB 3
341 BSCSE CSE 3712 Computer Networks Laboratory A 426 (Computer Lab) Mon 08:30:AM - 11:00:AM - Abu Bakar Fahad ABF 1
342 BSCSE CSE 3712 Computer Networks Laboratory B 530 (Computer Lab) Sun 11:11:AM - 01:40:PM - Abdullah Ibne Masud Mahi AIMM 1
343 BSCSE CSE 3712 Computer Networks Laboratory C 426 (Computer Lab) Sun 02:00:PM - 04:30:PM - Md. Muhyminul Haque MdMH 1
344 BSCSE CSE 3712 Computer Networks Laboratory D 528 (Computer Lab) Tue 11:11:AM - 01:40:PM - Mr. Abid Hasan Khondaker Mr. Abid Hasan Khondaker 1
345 BSCSE CSE 3712 Computer Networks Laboratory E 528 (Computer Lab) Tue 08:30:AM - 11:00:AM - Mr. Abid Hasan Khondaker MfSh 1
346 BSCSE CSE 3712 Computer Networks Laboratory F 523 (Computer Lab) Mon 11:11:AM - 01:40:PM - Mr. Abid Hasan Khondaker ABF 1
347 BSCSE CSE 3712 Computer Networks Laboratory G 427 (Computer Lab) Mon 02:00:PM - 04:30:PM - Mr. Abid Hasan Khondaker Mr. Abid Hasan Khondaker 1
348 BSCSE CSE 3712 Computer Networks Laboratory H 529 (Computer Lab) Tue 02:00:PM - 04:30:PM - Zaara Zabeen Arpa ZZA 1
349 BSCSE CSE 3712 Computer Networks Laboratory I 529 (Computer Lab) Tue 08:30:AM - 11:00:AM - Abu Bakar Fahad ABF 1
350 BSCSE CSE 3712 Computer Networks Laboratory J 530 (Computer Lab) Wed 11:11:AM - 01:40:PM - Abdullah Ibne Masud Mahi AIMM 1
351 BSCSE CSE 3712 Computer Networks Laboratory K 528 (Computer Lab) Wed 02:00:PM - 04:30:PM - Md. Muhyminul Haque MdMH 1
352 BSCSE CSE 3712 Computer Networks Laboratory L 528 (Computer Lab) Wed 08:30:AM - 11:00:AM - Zaara Zabeen Arpa ZZA 1
353 BSCSE CSE 3715 Data Communication A 402 402 Sat Tue 09:51:AM - 11:10:AM 09:51:AM - 11:10:AM Ashraful Islam Paran AIP 3
354 BSCSE CSE 3811 Artificial Intelligence A 403 403 Sat Tue 08:30:AM - 09:50:AM 08:30:AM - 09:50:AM Mr. Sheikh Mostofa Amir Foisol Mr. Sheikh Mostofa Amir Foisol 3
355 BSCSE CSE 3811 Artificial Intelligence B 403 403 Sat Tue 09:51:AM - 11:10:AM 09:51:AM - 11:10:AM Md. Suzauddola MdSu 3
356 BSCSE CSE 3811 Artificial Intelligence C 404 404 Sat Tue 11:11:AM - 12:30:PM 11:11:AM - 12:30:PM Mr. Md. Tamim Iqbal Mr. Md. Tamim Iqbal 3
357 BSCSE CSE 3811 Artificial Intelligence D 403 403 Sat Tue 12:31:PM - 01:50:PM 12:31:PM - 01:50:PM Rubaiya Rahtin Khan RRK 3
358 BSCSE CSE 3811 Artificial Intelligence E 329 329 Sat Tue 01:51:PM - 03:10:PM 01:51:PM - 03:10:PM Mr. Md. Tamim Iqbal Mr. Md. Tamim Iqbal 3
359 BSCSE CSE 3811 Artificial Intelligence F 325 325 Sat Tue 03:11:PM - 04:30:PM 03:11:PM - 04:30:PM Md. Suzauddola MdSu 3
360 BSCSE CSE 3811 Artificial Intelligence G 402 402 Sun Wed 08:30:AM - 09:50:AM 08:30:AM - 09:50:AM Nahid Ferdous Aurna NaFA 3
361 BSCSE CSE 3811 Artificial Intelligence H 401 401 Sun Wed 09:51:AM - 11:10:AM 09:51:AM - 11:10:AM Md. Tanvir Raihan MTR 3
362 BSCSE CSE 3811 Artificial Intelligence I 404 404 Sun Wed 11:11:AM - 12:30:PM 11:11:AM - 12:30:PM Nahid Ferdous Aurna NaFA 3
363 BSCSE CSE 3811 Artificial Intelligence J 401 401 Sun Wed 12:31:PM - 01:50:PM 12:31:PM - 01:50:PM Rubaiya Rahtin Khan RRK 3
364 BSCSE CSE 3811 Artificial Intelligence K 402 402 Sun Wed 01:51:PM - 03:10:PM 01:51:PM - 03:10:PM Arnab Bhattacharjee ArBh 3
365 BSCSE CSE 3811 Artificial Intelligence L 401 401 Sun Wed 03:11:PM - 04:30:PM 03:11:PM - 04:30:PM Rakibul Hasan Rafi RaHR 3
366 BSCSE CSE 3812 Artificial Intelligence Laboratory A 727 (Computer Lab) Sun 11:11:AM - 01:40:PM - Mr. Sheikh Mostofa Amir Foisol Mr. Sheikh Mostofa Amir Foisol 1
367 BSCSE CSE 3812 Artificial Intelligence Laboratory B 727 (Computer Lab) Wed 11:11:AM - 01:40:PM - Md. Enamul Haque MEHq 1
368 BSCSE CSE 3812 Artificial Intelligence Laboratory C 826 (Computer Lab) Sat 02:00:PM - 04:30:PM - Md. Taky Shaharair MTSh 1
369 BSCSE CSE 3812 Artificial Intelligence Laboratory D 529 (Computer Lab) Tue 11:11:AM - 01:40:PM - Raiyan Janik Monir RJM 1
370 BSCSE CSE 3812 Artificial Intelligence Laboratory E 826 (Computer Lab) Sun 11:11:AM - 01:40:PM - Mr. Mabsur Fatin Bin Hossain Mr. Mabsur Fatin Bin Hossain 1
371 BSCSE CSE 3812 Artificial Intelligence Laboratory F 427 (Computer Lab) Sun 02:00:PM - 04:30:PM - Mr. Md. Tamim Iqbal Mr. Md. Tamim Iqbal 1
372 BSCSE CSE 3812 Artificial Intelligence Laboratory M 528 (Computer Lab) Mon 11:11:AM - 01:40:PM - Mr. Md. Tamim Iqbal Mr. Md. Tamim Iqbal 1
373 BSCSE CSE 3812 Artificial Intelligence Laboratory N 523 (Computer Lab) Mon 02:00:PM - 04:30:PM - Jerin Hasan Priya JHP 1
374 BSCSE CSE 3812 Artificial Intelligence Laboratory G 530 (Computer Lab) Tue 08:30:AM - 11:00:AM - Md. Taky Shaharair MTSh 1
375 BSCSE CSE 3812 Artificial Intelligence Laboratory H 530 (Computer Lab) Tue 11:11:AM - 01:40:PM - Siana Rizwan SnRn 1
376 BSCSE CSE 3812 Artificial Intelligence Laboratory I 530 (Computer Lab) Tue 02:00:PM - 04:30:PM - Mr. Masnoon Muztahid Mr. Masnoon Muztahid 1
377 BSCSE CSE 3812 Artificial Intelligence Laboratory J 529 (Computer Lab) Wed 08:30:AM - 11:00:AM - Fairoz Anika FzAn 1
378 BSCSE CSE 3812 Artificial Intelligence Laboratory K 826 (Computer Lab) Wed 11:11:AM - 01:40:PM - Diniya Tahrin Bhuiyan DTB 1
379 BSCSE CSE 3812 Artificial Intelligence Laboratory L 529 (Computer Lab) Wed 02:00:PM - 04:30:PM - Md. Enamul Haque MEHq 1
380 BSCSE CSE 4000A Final Year Design Project - I A 530 (Computer Lab) Sat 08:30:AM - 11:00:AM - Hasan Sarwar HS 2
381 BSCSE CSE 4000A Final Year Design Project - I B 528 (Computer Lab) Sun 08:30:AM - 11:00:AM - Muhammad Nomani Kabir MNK 2
382 BSCSE CSE 4000A Final Year Design Project - I C 426 (Computer Lab) Sun 11:11:AM - 01:40:PM - Mohammad Nurul Huda MNH 2
383 BSCSE CSE 4000A Final Year Design Project - I D 727 (Computer Lab) Sat 08:30:AM - 11:00:AM - Md. Motaharul Islam MdMIm 2
384 BSCSE CSE 4000A Final Year Design Project - I E 727 (Computer Lab) Tue 08:30:AM - 11:00:AM - Suman Ahmmed SA 2
385 BSCSE CSE 4000A Final Year Design Project - I F 626 (Computer Lab) Tue 11:11:AM - 01:40:PM - Al-Sakib Khan Pathan ASKP 2
386 BSCSE CSE 4000A Final Year Design Project - I G 626 (Computer Lab) Tue 02:00:PM - 04:30:PM - Riasat Azim RtAm 2
387 BSCSE CSE 4000A Final Year Design Project - I H 530 (Computer Lab) Wed 08:30:AM - 11:00:AM - Ohidujjaman Ojn 2
388 BSCSE CSE 4000A Final Year Design Project - I I 626 (Computer Lab) Sat 11:11:AM - 01:40:PM - Mohammad Shahriar Rahman MdSR 2
389 BSCSE CSE 4000A Final Year Design Project - I J 426 (Computer Lab) Wed 11:11:AM - 01:40:PM - Jannatun Noor Mukta JNM 2
390 BSCSE CSE 4125 Ethical Hacking and Network Defense A 523 (Computer Lab) Sun 02:00:PM - 04:30:PM - Mohammad Mamun Elahi ME 3
391 BSCSE CSE 4133 Business Intelligence A 402 402 Sun Wed 12:31:PM - 01:50:PM 12:31:PM - 01:50:PM Md. Anowarul Abedin MAnAn 3
392 BSCSE CSE 4165 Web Programming A 826 (Computer Lab) Sat 08:30:AM - 11:00:AM - Farhan Anan Himu FAH 3
393 BSCSE CSE 4165 Web Programming B 727 (Computer Lab) Sat 11:11:AM - 01:40:PM - Farhan Anan Himu FAH 3
394 BSCSE CSE 4165 Web Programming C 827 (Computer Lab) Sat 02:00:PM - 04:30:PM - Tasmia Binte Sogir TBS 3
395 BSCSE CSE 4165 Web Programming D 827 (Computer Lab) Sat 08:30:AM - 11:00:AM - Hafijul Hoque Chowdhury HHCh 3
396 BSCSE CSE 4165 Web Programming E 529 (Computer Lab) Sun 08:30:AM - 11:00:AM - Mr. Abid Hasan Khondaker Mr. Abid Hasan Khondaker 3
397 BSCSE CSE 4165 Web Programming F 926 (Computer Lab) Sun 11:11:AM - 01:40:PM - Pranta Biswas PB 3
398 BSCSE CSE 4165 Web Programming M 727 (Computer Lab) Tue 11:11:AM - 01:40:PM - Farhan Anan Himu FAH 3
399 BSCSE CSE 4165 Web Programming N 727 (Computer Lab) Tue 02:00:PM - 04:30:PM - Kazi Abdun Noor KAN 3
400 BSCSE CSE 4165 Web Programming O 626 (Computer Lab) Wed 08:30:AM - 11:00:AM - Mahmudul Hasan MahHsn 3
401 BSCSE CSE 4165 Web Programming P 926 (Computer Lab) Wed 11:11:AM - 01:40:PM - Pranta Biswas PB 3
402 BSCSE CSE 4165 Web Programming Q 530 (Computer Lab) Wed 02:00:PM - 04:30:PM - Sayem Shahad SmSd 3
403 BSCSE CSE 4165 Web Programming R 727 (Computer Lab) Wed 08:30:AM - 11:00:AM - Sayem Shahad SmSd 3
404 BSCSE CSE 4165 Web Programming G 528 (Computer Lab) Sun 02:00:PM - 04:30:PM - Kazi Abdun Noor KAN 3
405 BSCSE CSE 4165 Web Programming H 529 (Computer Lab) Sun 02:00:PM - 04:30:PM - Mahmudul Hasan MahHsn 3
406 BSCSE CSE 4165 Web Programming I 427 (Computer Lab) Mon 08:30:AM - 11:00:AM - Mahmudul Hasan MahHsn 3
407 BSCSE CSE 4165 Web Programming J 529 (Computer Lab) Mon 11:11:AM - 01:40:PM - Rafid Nahiyan Farabi RNF 3
408 BSCSE CSE 4165 Web Programming K 528 (Computer Lab) Mon 02:00:PM - 04:30:PM - Mr. Md. Tamim Iqbal Mr. Md. Tamim Iqbal 3
409 BSCSE CSE 4165 Web Programming L 826 (Computer Lab) Tue 08:30:AM - 11:00:AM - Farhan Anan Himu FAH 3
410 BSCSE CSE 4181 Mobile Application Development A 530 (Computer Lab) Sun 08:30:AM - 11:00:AM - Kazi Abdun Noor KAN 3
411 BSCSE CSE 4181 Mobile Application Development B 826 (Computer Lab) Tue 11:11:AM - 01:40:PM - Kazi Abdun Noor KAN 3
412 BSCSE CSE 4325 Microprocessors and Microcontrollers A 405 405 Sat Tue 11:11:AM - 12:30:PM 11:11:AM - 12:30:PM Sudipto Mondal SuMo 3
413 BSCSE CSE 4325 Microprocessors and Microcontrollers B 402 402 Sun Wed 03:11:PM - 04:30:PM 03:11:PM - 04:30:PM Rafid Nahiyan Farabi RNF 3
414 BSCSE CSE 4325 Microprocessors and Microcontrollers C 404 404 Sat Tue 12:31:PM - 01:50:PM 12:31:PM - 01:50:PM Sudipto Mondal SuMo 3
415 BSCSE CSE 4325 Microprocessors and Microcontrollers D 402 402 Sun Wed 09:51:AM - 11:10:AM 09:51:AM - 11:10:AM Arnab Bhattacharjee ArBh 3
416 BSCSE CSE 4325 Microprocessors and Microcontrollers E 330 330 Sat Tue 01:51:PM - 03:10:PM 01:51:PM - 03:10:PM Arnab Bhattacharjee ArBh 3
417 BSCSE CSE 4325 Microprocessors and Microcontrollers F 405 405 Sun Wed 11:11:AM - 12:30:PM 11:11:AM - 12:30:PM M. Fahmin Rahman MFRn 3
418 BSCSE CSE 4325 Microprocessors and Microcontrollers H 403 403 Sun Wed 12:31:PM - 01:50:PM 12:31:PM - 01:50:PM Rafid Nahiyan Farabi RNF 3
419 BSCSE CSE 4325 Microprocessors and Microcontrollers I 403 403 Sun Wed 08:30:AM - 09:50:AM 08:30:AM - 09:50:AM Arnab Bhattacharjee ArBh 3
420 BSCSE CSE 4325 Microprocessors and Microcontrollers J 404 404 Sat Tue 09:51:AM - 11:10:AM 09:51:AM - 11:10:AM M. Fahmin Rahman MFRn 3
421 BSCSE CSE 4325 Microprocessors and Microcontrollers G 404 404 Sat Tue 08:30:AM - 09:50:AM 08:30:AM - 09:50:AM M. Fahmin Rahman MFRn 3
422 BSCSE CSE 4326 Microprocessors and Microcontrollers Laboratory A 508 (Digital Lab) Sat 08:30:AM - 11:00:AM - Sudipto Mondal SuMo 1
423 BSCSE CSE 4326 Microprocessors and Microcontrollers Laboratory B 508 (Digital Lab) Sat 11:11:AM - 01:40:PM - Rafid Nahiyan Farabi RNF 1
424 BSCSE CSE 4326 Microprocessors and Microcontrollers Laboratory C 511 (Digital Lab) Sun 08:30:AM - 11:00:AM - Sudipto Mondal SuMo 1
425 BSCSE CSE 4326 Microprocessors and Microcontrollers Laboratory D 508 (Digital Lab) Sun 11:11:AM - 01:40:PM - Md. Abid Hossain AbHn 1
426 BSCSE CSE 4326 Microprocessors and Microcontrollers Laboratory E 508 (Digital Lab) Sun 02:00:PM - 04:30:PM - M. Fahmin Rahman MFRn 1
427 BSCSE CSE 4326 Microprocessors and Microcontrollers Laboratory F 511 (Digital Lab) Tue 08:30:AM - 11:00:AM - Raiyan Janik Monir RJM 1
428 BSCSE CSE 4326 Microprocessors and Microcontrollers Laboratory M 501 (Circuit Lab) Sat 08:30:AM - 11:00:AM - Arnab Bhattacharjee ArBh 1
429 BSCSE CSE 4326 Microprocessors and Microcontrollers Laboratory G 511 (Digital Lab) Tue 11:11:AM - 01:40:PM - Arnab Bhattacharjee ArBh 1
430 BSCSE CSE 4326 Microprocessors and Microcontrollers Laboratory H 508 (Digital Lab) Tue 02:00:PM - 04:30:PM - M. Fahmin Rahman MFRn 1
431 BSCSE CSE 4326 Microprocessors and Microcontrollers Laboratory I 511 (Digital Lab) Wed 08:30:AM - 11:00:AM - Rafid Nahiyan Farabi RNF 1
432 BSCSE CSE 4326 Microprocessors and Microcontrollers Laboratory J 508 (Digital Lab) Wed 11:11:AM - 01:40:PM - Mr. Angkon Deb Mr. Angkon Deb 1
433 BSCSE CSE 4326 Microprocessors and Microcontrollers Laboratory K 508 (Digital Lab) Wed 02:00:PM - 04:30:PM - Liakat Omar Rihan LOR 1
434 BSCSE CSE 4326 Microprocessors and Microcontrollers Laboratory L 508 (Digital Lab) Wed 08:30:AM - 11:00:AM - Jerin Hasan Priya JHP 1
435 BSCSE CSE 4327 VLSI Design A 427 (Computer Lab) Sun 11:11:AM - 01:40:PM - Sudipto Mondal SuMo 3
436 BSCSE CSE 4399 Special Topics - Embedded Machine Learning A 730 730 Sat Tue 09:51:AM - 11:10:AM 09:51:AM - 11:10:AM Siddique Md. Lutful Kabir / Mr. Angkon Deb Deb 3
437 BSCSE CSE 4435 Software Architecture A 404 404 Sun Wed 08:30:AM - 09:50:AM 08:30:AM - 09:50:AM Tanmoy Bipro Das TBD 3
438 BSCSE CSE 4435 Software Architecture B 401 401 Sat Tue 01:51:PM - 03:10:PM 01:51:PM - 03:10:PM Tanmoy Bipro Das TBD 3
439 BSCSE CSE 4435 Software Architecture C 403 403 Sun Wed 03:11:PM - 04:30:PM 03:11:PM - 04:30:PM Zaara Zabeen Arpa ZZA 3
440 BSCSE CSE 4451 Human Computer Interaction A 405 405 Sat Tue 08:30:AM - 09:50:AM 08:30:AM - 09:50:AM Novia Nurain NN 3
441 BSCSE CSE 4451 Human Computer Interaction B 405 405 Sat Tue 09:51:AM - 11:10:AM 09:51:AM - 11:10:AM Novia Nurain NN 3
442 BSCSE CSE 4451 Human Computer Interaction C 328 328 Sat Tue 03:11:PM - 04:30:PM 03:11:PM - 04:30:PM Md. Sajjad Hossain MSdHn 3
443 BSCSE CSE 4451 Human Computer Interaction D 405 405 Sun Wed 08:30:AM - 09:50:AM 08:30:AM - 09:50:AM Nabila Sabrin Sworna NSS 3
444 BSCSE CSE 4451 Human Computer Interaction E 403 403 Sun Wed 01:51:PM - 03:10:PM 01:51:PM - 03:10:PM Nabila Sabrin Sworna NSS 3
445 BSCSE CSE 4451 Human Computer Interaction F 404 404 Sun Wed 03:11:PM - 04:30:PM 03:11:PM - 04:30:PM Nahin F. Siddiqui NaFS 3
446 BSCSE CSE 4495 Software Testing and Quality Assurance A 404 404 Sun Wed 12:31:PM - 01:50:PM 12:31:PM - 01:50:PM Mobaswirul Islam MoIsm 3
447 BSCSE CSE 4495 Software Testing and Quality Assurance B 406 406 Sat Tue 11:11:AM - 12:30:PM 11:11:AM - 12:30:PM Mobaswirul Islam MoIsm 3
448 BSCSE CSE 4495 Software Testing and Quality Assurance C 402 402 Sat Tue 01:51:PM - 03:10:PM 01:51:PM - 03:10:PM Mobaswirul Islam MoIsm 3
449 BSCSE CSE 4509 Operating Systems A 406 406 Sat Tue 08:30:AM - 09:50:AM 08:30:AM - 09:50:AM Md. Siam MdSam 3
450 BSCSE CSE 4509 Operating Systems B 405 405 Sat Tue 12:31:PM - 01:50:PM 12:31:PM - 01:50:PM Md. Siam MdSam 3
451 BSCSE CSE 4509 Operating Systems C 403 403 Sat Tue 01:51:PM - 03:10:PM 01:51:PM - 03:10:PM Md. Enamul Haque MEHq 3
452 BSCSE CSE 4509 Operating Systems D 329 329 Sat Tue 03:11:PM - 04:30:PM 03:11:PM - 04:30:PM Md. Siam MdSam 3
453 BSCSE CSE 4509 Operating Systems E 406 406 Sun Wed 08:30:AM - 09:50:AM 08:30:AM - 09:50:AM Mr. Syed Tauhid Zuhori Mr. Syed Tauhid Zuhori 3
454 BSCSE CSE 4509 Operating Systems F 406 406 Sun Wed 11:11:AM - 12:30:PM 11:11:AM - 12:30:PM Md. Siam MdSam 3
455 BSCSE CSE 4509 Operating Systems G 404 404 Sun Wed 01:51:PM - 03:10:PM 01:51:PM - 03:10:PM Md. Sajjad Hossain MSdHn 3
456 BSCSE CSE 4509 Operating Systems H 405 405 Sun Wed 03:11:PM - 04:30:PM 03:11:PM - 04:30:PM Md. Sajjad Hossain MSdHn 3
457 BSCSE CSE 4509 Operating Systems I 403 403 Sun Wed 09:51:AM - 11:10:AM 09:51:AM - 11:10:AM Azizur Rahman Anik ARnA 3
458 BSCSE CSE 4510 Operating Systems Laboratory A 626 (Computer Lab) Sat 02:00:PM - 04:30:PM - Nahin F. Siddiqui NaFS 1
459 BSCSE CSE 4510 Operating Systems Laboratory B 926 (Computer Lab) Sat 08:30:AM - 11:00:AM - Ms. Mehreen Hossain Chowdhury Ms. Mehreen Hossain Chowdhury 1
460 BSCSE CSE 4510 Operating Systems Laboratory C 530 (Computer Lab) Sun 02:00:PM - 04:30:PM - Md. Siam MdSam 1
461 BSCSE CSE 4510 Operating Systems Laboratory D 727 (Computer Lab) Sun 08:30:AM - 11:00:AM - Shahil Yasar Haque SYH 1
462 BSCSE CSE 4510 Operating Systems Laboratory E 530 (Computer Lab) Mon 11:11:AM - 01:40:PM - Md. Zunaid-Ul-Alam MZUA 1
463 BSCSE CSE 4510 Operating Systems Laboratory F 529 (Computer Lab) Mon 02:00:PM - 04:30:PM - Shahil Yasar Haque SYH 1
464 BSCSE CSE 4510 Operating Systems Laboratory G 626 (Computer Lab) Mon 11:11:AM - 01:40:PM - Kazi Abdun Noor KAN 1
465 BSCSE CSE 4510 Operating Systems Laboratory H 827 (Computer Lab) Tue 11:11:AM - 01:40:PM - Nahin F. Siddiqui NaFS 1
466 BSCSE CSE 4510 Operating Systems Laboratory I 826 (Computer Lab) Tue 02:00:PM - 04:30:PM - Shahil Yasar Haque SYH 1
467 BSCSE CSE 4510 Operating Systems Laboratory J 827 (Computer Lab) Tue 08:30:AM - 11:00:AM - Diniya Tahrin Bhuiyan DTB 1
468 BSCSE CSE 4510 Operating Systems Laboratory K 626 (Computer Lab) Wed 02:00:PM - 04:30:PM - Md. Siam MdSam 1
469 BSCSE CSE 4510 Operating Systems Laboratory L 826 (Computer Lab) Wed 08:30:AM - 11:00:AM - Md. Enamul Haque MEHq 1
470 BSCSE CSE 4531 Computer Security A 425 425 Sat Tue 11:11:AM - 12:30:PM 11:11:AM - 12:30:PM Nahid Ferdous Aurna NaFA 3
471 BSCSE CSE 4531 Computer Security B 406 406 Sat Tue 12:31:PM - 01:50:PM 12:31:PM - 01:50:PM Azizur Rahman Anik ARnA 3
472 BSCSE CSE 4531 Computer Security C 425 425 Sat Tue 08:30:AM - 09:50:AM 08:30:AM - 09:50:AM Nahid Ferdous Aurna NaFA 3
473 BSCSE CSE 4531 Computer Security D 404 404 Sun Wed 09:51:AM - 11:10:AM 09:51:AM - 11:10:AM Md. Shohrab Hossain MShH 3
474 BSCSE CSE 4531 Computer Security E 407 407 Sun Wed 11:11:AM - 12:30:PM 11:11:AM - 12:30:PM Md. Taky Shaharair MTSh 3
475 BSCSE CSE 4531 Computer Security F 405 405 Sun Wed 01:51:PM - 03:10:PM 01:51:PM - 03:10:PM Md. Taky Shaharair MTSh 3
476 BSCSE CSE 4531 Computer Security G 406 406 Sat Tue 09:51:AM - 11:10:AM 09:51:AM - 11:10:AM Azizur Rahman Anik ARnA 3
477 BSCSE CSE 4531 Computer Security H 406 406 Sun Wed 03:11:PM - 04:30:PM 03:11:PM - 04:30:PM Azizur Rahman Anik ARnA 3
478 BSCSE CSE 4531 Computer Security I 428 428 Sat Tue 08:30:AM - 09:50:AM 08:30:AM - 09:50:AM Abrar Mahmud ArMd 3
479 BSCSE CSE 4587 Cloud Computing A 727 (Computer Lab) Sun 02:00:PM - 04:30:PM - Md. Mushfiqul Haque Omi MHO 3
480 BSCSE CSE 4587 Cloud Computing B 626 (Computer Lab) Wed 11:11:AM - 01:40:PM - Md. Mushfiqul Haque Omi MHO 3
481 BSCSE CSE 4611 Compiler Design A 429 429 Sat Tue 08:30:AM - 09:50:AM 08:30:AM - 09:50:AM Nabila Sabrin Sworna NSS 3
482 BSCSE CSE 4611 Compiler Design B 407 407 Sun Wed 08:30:AM - 09:50:AM 08:30:AM - 09:50:AM Anindya Hoque AnHq 3
483 BSCSE CSE 4611 Compiler Design C 330 330 Sat Tue 03:11:PM - 04:30:PM 03:11:PM - 04:30:PM Anindya Hoque AnHq 3
484 BSCSE CSE 4777 Networks Security A 405 405 Sun Wed 12:31:PM - 01:50:PM 12:31:PM - 01:50:PM Md. Shohrab Hossain MShH 3
485 BSCSE CSE 4811 Natural Language Processing A 408 408 Sun Wed 08:30:AM - 09:50:AM 08:30:AM - 09:50:AM Muhammad Anwarul Azim MAnAm 3
486 BSCSE CSE 4813 Deep Learning A 730 730 Sat Tue 01:51:PM - 03:10:PM 01:51:PM - 03:10:PM Ohidujjaman Ojn 3
487 BSCSE CSE 4817 Big Data Analytics A 425 425 Sat Tue 12:31:PM - 01:50:PM 12:31:PM - 01:50:PM Dewan Md. Farid DMF 3
488 BSCSE CSE 4883 Digital Image Processing A 428 428 Sat Tue 11:11:AM - 12:30:PM 11:11:AM - 12:30:PM Md. Tanvir Raihan MTR 3
489 BSCSE CSE 4883 Digital Image Processing B 425 425 Sat Tue 09:51:AM - 11:10:AM 09:51:AM - 11:10:AM Md. Tanvir Raihan MTR 3
490 BSCSE CSE 4883 Digital Image Processing C 404 404 Sat Tue 01:51:PM - 03:10:PM 01:51:PM - 03:10:PM Md. Tanvir Raihan MTR 3
491 BSCSE CSE 4883 Digital Image Processing D 409 409 Sun Wed 08:30:AM - 09:50:AM 08:30:AM - 09:50:AM Md. Suzauddola MdSu 3
492 BSCSE CSE 4883 Digital Image Processing E 407 407 Sun Wed 03:11:PM - 04:30:PM 03:11:PM - 04:30:PM Md. Suzauddola MdSu 3
493 BSCSE CSE 4889 Machine Learning A 431 431 Sat Tue 08:30:AM - 09:50:AM 08:30:AM - 09:50:AM Sadia Islam SaIs 3
494 BSCSE CSE 4889 Machine Learning B 410 410 Sun Wed 08:30:AM - 09:50:AM 08:30:AM - 09:50:AM Sadia Islam SaIs 3
495 BSCSE CSE 4889 Machine Learning C 408 408 Sun Wed 03:11:PM - 04:30:PM 03:11:PM - 04:30:PM Asif Abrar AsAr 3
496 BSCSE CSE 4889 Machine Learning D 405 405 Sat Tue 01:51:PM - 03:10:PM 01:51:PM - 03:10:PM Md. Suzauddola MdSu 3
497 BSCSE CSE 4889 Machine Learning E 428 428 Sat Tue 12:31:PM - 01:50:PM 12:31:PM - 01:50:PM Ohidujjaman Ojn 3
498 BSCSE CSE 4889 Machine Learning F 407 407 Sun Wed 01:51:PM - 03:10:PM 01:51:PM - 03:10:PM Mr. Abid Hasan Khondaker Mr. Abid Hasan Khondaker 3
499 BSCSE CSE 4889 Machine Learning G 408 408 Sun Wed 11:11:AM - 12:30:PM 11:11:AM - 12:30:PM Mr. Abid Hasan Khondaker Mr. Abid Hasan Khondaker 3
500 BSCSE CSE 4889 Machine Learning H 428 428 Sat Tue 09:51:AM - 11:10:AM 09:51:AM - 11:10:AM Charles Aunkan Gomes CAG 3
501 BSCSE CSE 4891 Data Mining A 429 429 Sat Tue 11:11:AM - 12:30:PM 11:11:AM - 12:30:PM Sayem Shahad SmSd 3
502 BSCSE CSE 4891 Data Mining B 429 429 Sat Tue 09:51:AM - 11:10:AM 09:51:AM - 11:10:AM Ohidujjaman Ojn 3
503 BSCSE CSE 4891 Data Mining C 406 406 Sat Tue 01:51:PM - 03:10:PM 01:51:PM - 03:10:PM Sadia Islam SaIs 3
504 BSCSE CSE 4891 Data Mining D 405 405 Sun Wed 09:51:AM - 11:10:AM 09:51:AM - 11:10:AM Charles Aunkan Gomes CAG 3
505 BSCSE CSE 4891 Data Mining E 409 409 Sun Wed 11:11:AM - 12:30:PM 11:11:AM - 12:30:PM Sadia Islam SaIs 3
506 BSCSE CSE 4891 Data Mining F 406 406 Sun Wed 12:31:PM - 01:50:PM 12:31:PM - 01:50:PM Rizvan Jawad Ruhan RJR 3
507 BSCSE CSE 4893 Introduction to Bioinformatics A 407 407 Sun Wed 12:31:PM - 01:50:PM 12:31:PM - 01:50:PM Riasat Azim RtAm 3
508 BSCSE CSE 4945 UI: Concepts and Design A 927 (Computer Lab) Sat 02:00:PM - 04:30:PM - Pranta Biswas PB 3
509 BSCSE CSE 4945 UI: Concepts and Design B 827 (Computer Lab) Wed 08:30:AM - 11:00:AM - Tasmia Binte Sogir TBS 3
510 BSCSE CSE 4945 UI: Concepts and Design C 927 (Computer Lab) Sun 11:11:AM - 01:40:PM - Tasmia Binte Sogir TBS 3
511 BSCSE ECO 4101 Economics A 429 429 Sat Tue 12:31:PM - 01:50:PM 12:31:PM - 01:50:PM Tasneem Jahan Tumpa TJT 3
512 BSCSE ECO 4101 Economics E 406 406 Sun Wed 09:51:AM - 11:10:AM 09:51:AM - 11:10:AM Tanzila Amir TaA 3
513 BSCSE ECO 4101 Economics F 410 410 Sun Wed 11:11:AM - 12:30:PM 11:11:AM - 12:30:PM Tasneem Jahan Tumpa TJT 3
514 BSCSE ECO 4101 Economics C 401 401 Sat Tue 03:11:PM - 04:30:PM 03:11:PM - 04:30:PM Mohammad Akhtaruzzaman MdAkh 3
515 BSCSE ECO 4101 Economics D 432 432 Sat Tue 08:30:AM - 09:50:AM 08:30:AM - 09:50:AM Mohammad Akhtaruzzaman MdAkh 3
516 BSCSE ECO 4101 Economics B 408 408 Sat Tue 01:51:PM - 03:10:PM 01:51:PM - 03:10:PM Tanzila Amir TaA 3
517 BSCSE ECO 4101 Economics G 408 408 Sun Wed 01:51:PM - 03:10:PM 01:51:PM - 03:10:PM Antara Chowdhury ACh 3
518 BSCSE ECO 4101 Economics H 409 409 Sun Wed 03:11:PM - 04:30:PM 03:11:PM - 04:30:PM Tasneem Jahan Tumpa TJT 3
519 BSCSE EEE 2113 Electrical Circuits A 601 601 Sat Tue 08:30:AM - 09:50:AM 08:30:AM - 09:50:AM Md. Abid Hossain AbHn 3
520 BSCSE EEE 2113 Electrical Circuits B 431 431 Sat Tue 09:51:AM - 11:10:AM 09:51:AM - 11:10:AM Md. Abid Hossain AbHn 3
521 BSCSE EEE 2113 Electrical Circuits C 431 431 Sat Tue 11:11:AM - 12:30:PM 11:11:AM - 12:30:PM Taki Yashir TY 3
522 BSCSE EEE 2113 Electrical Circuits D 402 402 Sat Tue 03:11:PM - 04:30:PM 03:11:PM - 04:30:PM Imran Hossain IHn 3
523 BSCSE EEE 2113 Electrical Circuits E 410 410 Sat Tue 01:51:PM - 03:10:PM 01:51:PM - 03:10:PM Liakat Omar Rihan LOR 3
524 BSCSE EEE 2113 Electrical Circuits F 425 425 Sun Wed 08:30:AM - 09:50:AM 08:30:AM - 09:50:AM Sajid Ahmed Chowdhury SdACh 3
525 BSCSE EEE 2113 Electrical Circuits G 407 407 Sun Wed 09:51:AM - 11:10:AM 09:51:AM - 11:10:AM Imran Hossain IHn 3
526 BSCSE EEE 2113 Electrical Circuits H 425 425 Sun Wed 11:11:AM - 12:30:PM 11:11:AM - 12:30:PM Mr. Md. Nadeem Chowdhury Mr. Md. Nadeem Chowdhury 3
527 BSCSE EEE 2113 Electrical Circuits I 408 408 Sun Wed 12:31:PM - 01:50:PM 12:31:PM - 01:50:PM Taki Yashir TY 3
528 BSCSE EEE 2113 Electrical Circuits J 409 409 Sun Wed 01:51:PM - 03:10:PM 01:51:PM - 03:10:PM Mr. Kazi Abid Hasan Mr. Kazi Abid Hasan 3
529 BSCSE EEE 2113 Electrical Circuits K 410 410 Sun Wed 03:11:PM - 04:30:PM 03:11:PM - 04:30:PM TBA TBA 3
530 BSCSE EEE 2123 Electronics A 403 403 Sat Tue 03:11:PM - 04:30:PM 03:11:PM - 04:30:PM Taki Yashir TY 3
531 BSCSE EEE 2123 Electronics B 432 432 Sat Tue 09:51:AM - 11:10:AM 09:51:AM - 11:10:AM Abu Shafin Mohammad Mahdee Jameel ASMMJ 3
532 BSCSE EEE 2123 Electronics C 432 432 Sat Tue 11:11:AM - 12:30:PM 11:11:AM - 12:30:PM Abu Shafin Mohammad Mahdee Jameel ASMMJ 3
533 BSCSE EEE 2123 Electronics D 431 431 Sat Tue 12:31:PM - 01:50:PM 12:31:PM - 01:50:PM Md. Abid Hossain AbHn 3
534 BSCSE EEE 2123 Electronics E 425 425 Sat Tue 01:51:PM - 03:10:PM 01:51:PM - 03:10:PM Taki Yashir TY 3
535 BSCSE EEE 2123 Electronics F 428 428 Sun Wed 08:30:AM - 09:50:AM 08:30:AM - 09:50:AM Sarwat Amin StA 3
536 BSCSE EEE 2123 Electronics G 408 408 Sun Wed 09:51:AM - 11:10:AM 09:51:AM - 11:10:AM Sarwat Amin StA 3
537 BSCSE EEE 2123 Electronics H 410 410 Sun Wed 01:51:PM - 03:10:PM 01:51:PM - 03:10:PM Mr. Md. Nadeem Chowdhury Mr. Md. Nadeem Chowdhury 3
538 BSCSE EEE 2123 Electronics I 409 409 Sun Wed 12:31:PM - 01:50:PM 12:31:PM - 01:50:PM Sarwat Amin StA 3
539 BSCSE EEE 2124 Electronics Laboratory A 505 (Circuit Lab) Sat 08:30:AM - 11:00:AM - Imran Hossain IHn 1
540 BSCSE EEE 2124 Electronics Laboratory B 825 (Digital Lab) Sat 11:11:AM - 01:40:PM - Mr. Md. Nadeem Chowdhury Mr. Md. Nadeem Chowdhury 1
541 BSCSE EEE 2124 Electronics Laboratory C 508 (Digital Lab) Sun 08:30:AM - 11:00:AM - Md. Abid Hossain AbHn 1
542 BSCSE EEE 2124 Electronics Laboratory D 825 (Digital Lab) Sun 11:11:AM - 01:40:PM - Imran Hossain IHn 1
543 BSCSE EEE 2124 Electronics Laboratory E 501 (Circuit Lab) Sun 02:00:PM - 04:30:PM - Taki Yashir TY 1
544 BSCSE EEE 2124 Electronics Laboratory F 508 (Digital Lab) Tue 08:30:AM - 11:00:AM - Jerin Hasan Priya JHP 1
545 BSCSE EEE 2124 Electronics Laboratory G 508 (Digital Lab) Tue 11:11:AM - 01:40:PM - Jerin Hasan Priya JHP 1
546 BSCSE EEE 2124 Electronics Laboratory H 825 (Digital Lab) Tue 02:00:PM - 04:30:PM - Mr. Md. Nadeem Chowdhury Mr. Md. Nadeem Chowdhury 1
547 BSCSE EEE 2124 Electronics Laboratory I 825 (Digital Lab) Wed 08:30:AM - 11:00:AM - Mr. Kazi Abid Hasan Mr. Kazi Abid Hasan 1
548 BSCSE EEE 2124 Electronics Laboratory J 825 (Digital Lab) Wed 11:11:AM - 01:40:PM - Imran Hossain IHn 1
549 BSCSE EEE 2124 Electronics Laboratory K 825 (Digital Lab) Wed 02:00:PM - 04:30:PM - Taki Yashir TY 1
550 BSCSE EEE 4261 Green Computing A 429 429 Sun Wed 08:30:AM - 09:50:AM 08:30:AM - 09:50:AM Md. Motaharul Islam MdMIm 3
551 BSCSE EEE 4261 Green Computing B 428 428 Sun Wed 11:11:AM - 12:30:PM 11:11:AM - 12:30:PM Md. Motaharul Islam MdMIm 3
552 BSCSE EEE 4261 Green Computing C 432 432 Sat Tue 12:31:PM - 01:50:PM 12:31:PM - 01:50:PM Shahriar Mahmud ShMd 3
553 BSCSE EEE 4261 Green Computing D 425 425 Sun Wed 01:51:PM - 03:10:PM 01:51:PM - 03:10:PM Md. Motaharul Islam MdMIm 3
554 BSCSE EEE 4261 Green Computing E 428 428 Sat Tue 01:51:PM - 03:10:PM 01:51:PM - 03:10:PM Shahriar Mahmud ShMd 3
555 BSCSE EEE 4261 Green Computing F 601 601 Sat Tue 09:51:AM - 11:10:AM 09:51:AM - 11:10:AM Tasriad Ahmed Tias TATs 3
556 BSCSE EEE 4261 Green Computing G 404 404 Sat Tue 03:11:PM - 04:30:PM 03:11:PM - 04:30:PM Sheikh Mohammed Al Hadi Elaf SMAHE 3
557 BSCSE EEE 4261 Green Computing H 425 425 Sun Wed 03:11:PM - 04:30:PM 03:11:PM - 04:30:PM Sheikh Mohammed Al Hadi Elaf SMAHE 3
558 BSCSE EEE 4261 Green Computing I 405 405 Sat Tue 03:11:PM - 04:30:PM 03:11:PM - 04:30:PM Tasriad Ahmed Tias TATs 3
559 BSCSE EEE 4261 Green Computing J 409 409 Sun Wed 09:51:AM - 11:10:AM 09:51:AM - 11:10:AM Shahriar Mahmud ShMd 3
560 BSCSE ENG 1011 English I AA 601 601 Sat Tue 11:11:AM - 12:30:PM 11:11:AM - 12:30:PM Nousin Laila Bristi NLB 3
561 BSCSE ENG 1011 English I AB 601 601 Sat Tue 12:31:PM - 01:50:PM 12:31:PM - 01:50:PM Chowdhury Omar Sharif COS 3
562 BSCSE ENG 1011 English I AC 429 429 Sat Tue 01:51:PM - 03:10:PM 01:51:PM - 03:10:PM Sajjad Hossain SaHsn 3
563 BSCSE ENG 1011 English I AD 602 602 Sat Tue 08:30:AM - 09:50:AM 08:30:AM - 09:50:AM Mir Md. Fazle Rabbi MMFR 3
564 BSCSE ENG 1011 English I AE 602 602 Sat Tue 09:51:AM - 11:10:AM 09:51:AM - 11:10:AM Md. Taqi Yasir MTY 3
565 BSCSE ENG 1011 English I AF 602 602 Sat Tue 11:11:AM - 12:30:PM 11:11:AM - 12:30:PM Dil Nusrat DN 3
566 BSCSE ENG 1011 English I AI 603 603 Sat Tue 08:30:AM - 09:50:AM 08:30:AM - 09:50:AM Sadia Islam SaIsm 3
567 BSCSE ENG 1011 English I AR 429 429 Sun Wed 01:51:PM - 03:10:PM 01:51:PM - 03:10:PM Khandoker Makjum Wahid KhMW 3
568 BSCSE ENG 1011 English I AS 429 429 Sun Wed 03:11:PM - 04:30:PM 03:11:PM - 04:30:PM Sadia Afrin SaAn 3
569 BSCSE ENG 1011 English I AV 432 432 Sat Tue 01:51:PM - 03:10:PM 01:51:PM - 03:10:PM Zolakha Akter Shifa ZAS 3
570 BSCSE ENG 1011 English I AN 431 431 Sun Wed 08:30:AM - 09:50:AM 08:30:AM - 09:50:AM TBA TBA 3
571 BSCSE ENG 1011 English I AO 410 410 Sun Wed 09:51:AM - 11:10:AM 09:51:AM - 11:10:AM Labib Rashid Inan LRI 3
572 BSCSE ENG 1011 English I AP 431 431 Sun Wed 11:11:AM - 12:30:PM 11:11:AM - 12:30:PM Sadia Islam SaIsm 3
573 BSCSE ENG 1011 English I AQ 425 425 Sun Wed 12:31:PM - 01:50:PM 12:31:PM - 01:50:PM Khandoker Makjum Wahid KhMW 3
574 BSCSE ENG 1011 English I AT 432 432 Sun Wed 11:11:AM - 12:30:PM 11:11:AM - 12:30:PM Nusrath Jahan Borna NJB 3
575 BSCSE ENG 1011 English I AU 428 428 Sun Wed 12:31:PM - 01:50:PM 12:31:PM - 01:50:PM Rifa Noor RfNr 3
576 BSCSE ENG 1011 English I AG 602 602 Sat Tue 12:31:PM - 01:50:PM 12:31:PM - 01:50:PM Muntasir Ahmad MAd 3
577 BSCSE ENG 1011 English I AH 431 431 Sat Tue 01:51:PM - 03:10:PM 01:51:PM - 03:10:PM Md. Taqi Yasir MTY 3
578 BSCSE ENG 1011 English I AJ 429 429 Sun Wed 11:11:AM - 12:30:PM 11:11:AM - 12:30:PM Zolakha Akter Shifa ZAS 3
579 BSCSE ENG 1011 English I AK 410 410 Sun Wed 12:31:PM - 01:50:PM 12:31:PM - 01:50:PM Sadia Afrin SaAn 3
580 BSCSE ENG 1011 English I AL 428 428 Sun Wed 01:51:PM - 03:10:PM 01:51:PM - 03:10:PM Zolakha Akter Shifa ZAS 3
581 BSCSE ENG 1011 English I AM 428 428 Sun Wed 03:11:PM - 04:30:PM 03:11:PM - 04:30:PM TBA TBA 3
582 BSCSE ENG 1013 English II AA 604 604 Sat Tue 08:30:AM - 09:50:AM 08:30:AM - 09:50:AM TBA TBA 3
583 BSCSE ENG 1013 English II AB 603 603 Sat Tue 09:51:AM - 11:10:AM 09:51:AM - 11:10:AM Christina Miti Rozario ChMR 3
584 BSCSE ENG 1013 English II AC 603 603 Sat Tue 11:11:AM - 12:30:PM 11:11:AM - 12:30:PM Nusrath Jahan Borna NJB 3
585 BSCSE ENG 1013 English II AD 429 429 Sun Wed 12:31:PM - 01:50:PM 12:31:PM - 01:50:PM TBA TBA 3
586 BSCSE ENG 1013 English II AE 432 432 Sun Wed 08:30:AM - 09:50:AM 08:30:AM - 09:50:AM Ismat Zarin IZn 3
587 BSCSE ENG 1013 English II AF 425 425 Sun Wed 09:51:AM - 11:10:AM 09:51:AM - 11:10:AM TBA TBA 3
588 BSCSE ENG 1013 English II AS 432 432 Sun Wed 03:11:PM - 04:30:PM 03:11:PM - 04:30:PM Muhammad Saiful Islam MSIsm 3
589 BSCSE ENG 1013 English II AM 429 429 Sun Wed 09:51:AM - 11:10:AM 09:51:AM - 11:10:AM Nusrath Jahan Borna NJB 3
590 BSCSE ENG 1013 English II AN 602 602 Sun Wed 08:30:AM - 09:50:AM 08:30:AM - 09:50:AM TBA TBA 3
591 BSCSE ENG 1013 English II AO 431 431 Sun Wed 09:51:AM - 11:10:AM 09:51:AM - 11:10:AM TBA TBA 3
592 BSCSE ENG 1013 English II AP 431 431 Sun Wed 03:11:PM - 04:30:PM 03:11:PM - 04:30:PM Ahmed Abdullah Bin Farooqi Rayhan AAFR 3
593 BSCSE ENG 1013 English II AQ 431 431 Sun Wed 01:51:PM - 03:10:PM 01:51:PM - 03:10:PM Nusrath Jahan Borna NJB 3
594 BSCSE ENG 1013 English II AR 432 432 Sun Wed 01:51:PM - 03:10:PM 01:51:PM - 03:10:PM Umme Habiba UmH 3
595 BSCSE ENG 1013 English II AG 601 601 Sun Wed 08:30:AM - 09:50:AM 08:30:AM - 09:50:AM TBA TBA 3
596 BSCSE ENG 1013 English II AH 428 428 Sun Wed 09:51:AM - 11:10:AM 09:51:AM - 11:10:AM Ismat Zarin IZn 3
597 BSCSE ENG 1013 English II AI 604 604 Sat Tue 09:51:AM - 11:10:AM 09:51:AM - 11:10:AM Mir Md. Fazle Rabbi MMFR 3
598 BSCSE ENG 1013 English II AJ 406 406 Sat Tue 03:11:PM - 04:30:PM 03:11:PM - 04:30:PM TBA TBA 3
599 BSCSE ENG 1013 English II AK 431 431 Sun Wed 12:31:PM - 01:50:PM 12:31:PM - 01:50:PM Kirsten Gudgeon KnGn 3
600 BSCSE ENG 1013 English II AL 408 408 Sat Tue 03:11:PM - 04:30:PM 03:11:PM - 04:30:PM Ahmed Abdullah Bin Farooqi Rayhan AAFR 3
601 BSCSE GED 1005 AI Literacy and Prompt Engineering A 523 (Computer Lab) Mon 08:30:AM - 11:00:AM - Nusaiba Zaman Manifa NZMa 3
602 BSCSE GED 1005 AI Literacy and Prompt Engineering B 727 (Computer Lab) Mon 11:11:AM - 01:40:PM - Syed Abu Ammar Muhammad Zarif SAMZ 3
603 BSCSE GED 1005 AI Literacy and Prompt Engineering C 530 (Computer Lab) Mon 02:00:PM - 04:30:PM - Mahmudul Hasan MahHsn 3
604 BSCSE GED 1005 AI Literacy and Prompt Engineering D 528 (Computer Lab) Mon 08:30:AM - 11:00:AM - Rafid Nahiyan Farabi RNF 3
605 BSCSE GED 1005 AI Literacy and Prompt Engineering E 826 (Computer Lab) Mon 11:11:AM - 01:40:PM - Nusaiba Zaman Manifa NZMa 3
606 BSCSE GED 1005 AI Literacy and Prompt Engineering F 626 (Computer Lab) Mon 02:00:PM - 04:30:PM - Syed Abu Ammar Muhammad Zarif SAMZ 3
607 BSCSE GED 1005 AI Literacy and Prompt Engineering G 827 (Computer Lab) Mon 11:11:AM - 01:40:PM - Md. Mehedi Hasan MdMeHn 3
608 BSCSE GED 1005 AI Literacy and Prompt Engineering H 727 (Computer Lab) Mon 02:00:PM - 04:30:PM - Md. Mehedi Hasan MdMeHn 3
609 BSCSE IPE 3401 Industrial and Operational Management A 601 601 Sat Tue 01:51:PM - 03:10:PM 01:51:PM - 03:10:PM Kaspia Kabir KKr 3
610 BSCSE IPE 3401 Industrial and Operational Management B 410 410 Sat Tue 03:11:PM - 04:30:PM 03:11:PM - 04:30:PM Kaspia Kabir KKr 3
611 BSCSE IPE 3401 Industrial and Operational Management C 601 601 Sun Wed 01:51:PM - 03:10:PM 01:51:PM - 03:10:PM Shaila Ahsan ShAhn 3
612 BSCSE IPE 3401 Industrial and Operational Management D 604 604 Sat Tue 11:11:AM - 12:30:PM 11:11:AM - 12:30:PM Shaila Ahsan ShAhn 3
613 BSCSE IPE 3401 Industrial and Operational Management E 432 432 Sun Wed 12:31:PM - 01:50:PM 12:31:PM - 01:50:PM Shaila Ahsan ShAhn 3
614 BSCSE MATH 1151 Fundamental Calculus A 603 603 Sun Wed 08:30:AM - 09:50:AM 08:30:AM - 09:50:AM Mohsina Rahman MoRhn 3
615 BSCSE MATH 1151 Fundamental Calculus B 432 432 Sun Wed 09:51:AM - 11:10:AM 09:51:AM - 11:10:AM Nazia Shifa Mugdha NSM 3
616 BSCSE MATH 1151 Fundamental Calculus C 601 601 Sun Wed 11:11:AM - 12:30:PM 11:11:AM - 12:30:PM Mohammad Mahmudul Hasan Chowdhury MMHC 3
617 BSCSE MATH 1151 Fundamental Calculus D 601 601 Sun Wed 12:31:PM - 01:50:PM 12:31:PM - 01:50:PM Al Amin Hossain AAHn 3
618 BSCSE MATH 1151 Fundamental Calculus E 602 602 Sun Wed 01:51:PM - 03:10:PM 01:51:PM - 03:10:PM Mohammad Mahmudul Hasan Chowdhury MMHC 3
619 BSCSE MATH 1151 Fundamental Calculus F 601 601 Sun Wed 03:11:PM - 04:30:PM 03:11:PM - 04:30:PM Myesha Myesha 3
620 BSCSE MATH 1151 Fundamental Calculus T 605 605 Sat Tue 12:31:PM - 01:50:PM 12:31:PM - 01:50:PM Md. Asadujjaman MdAsn 3
621 BSCSE MATH 1151 Fundamental Calculus U 425 425 Sat Tue 03:11:PM - 04:30:PM 03:11:PM - 04:30:PM Joyonty Ghosh JG 3
622 BSCSE MATH 1151 Fundamental Calculus V 604 604 Sun Wed 08:30:AM - 09:50:AM 08:30:AM - 09:50:AM Joyonty Ghosh JG 3
623 BSCSE MATH 1151 Fundamental Calculus W 603 603 Sun Wed 03:11:PM - 04:30:PM 03:11:PM - 04:30:PM Al Amin Hossain AAHn 3
624 BSCSE MATH 1151 Fundamental Calculus S 603 603 Sun Wed 12:31:PM - 01:50:PM 12:31:PM - 01:50:PM Myesha Myesha 3
625 BSCSE MATH 1151 Fundamental Calculus M 603 603 Sat Tue 12:31:PM - 01:50:PM 12:31:PM - 01:50:PM Tanveer Ahmed Khan Fahim TAKF 3
626 BSCSE MATH 1151 Fundamental Calculus N 602 602 Sat Tue 01:51:PM - 03:10:PM 01:51:PM - 03:10:PM Al Amin Hossain AAHn 3
627 BSCSE MATH 1151 Fundamental Calculus O 630 630 Sat Tue 08:30:AM - 09:50:AM 08:30:AM - 09:50:AM Al Amin Hossain AAHn 3
628 BSCSE MATH 1151 Fundamental Calculus P 630 630 Sat Tue 09:51:AM - 11:10:AM 09:51:AM - 11:10:AM Jashodhan Saha JAS 3
629 BSCSE MATH 1151 Fundamental Calculus Q 630 630 Sat Tue 11:11:AM - 12:30:PM 11:11:AM - 12:30:PM Myesha Myesha 3
630 BSCSE MATH 1151 Fundamental Calculus R 604 604 Sat Tue 12:31:PM - 01:50:PM 12:31:PM - 01:50:PM Mahtab Uddin MUn 3
631 BSCSE MATH 1151 Fundamental Calculus G 602 602 Sun Wed 12:31:PM - 01:50:PM 12:31:PM - 01:50:PM Tanveer Ahmed Khan Fahim TAKF 3
632 BSCSE MATH 1151 Fundamental Calculus H 603 603 Sun Wed 01:51:PM - 03:10:PM 01:51:PM - 03:10:PM Nazia Shifa Mugdha NSM 3
633 BSCSE MATH 1151 Fundamental Calculus I 602 602 Sun Wed 03:11:PM - 04:30:PM 03:11:PM - 04:30:PM Md. Asadujjaman MdAsn 3
634 BSCSE MATH 1151 Fundamental Calculus J 605 605 Sat Tue 08:30:AM - 09:50:AM 08:30:AM - 09:50:AM Myesha Myesha 3
635 BSCSE MATH 1151 Fundamental Calculus K 605 605 Sat Tue 09:51:AM - 11:10:AM 09:51:AM - 11:10:AM Muhaiminul Islam Adnan MIA 3
636 BSCSE MATH 1151 Fundamental Calculus L 605 605 Sat Tue 11:11:AM - 12:30:PM 11:11:AM - 12:30:PM Ashek Ahmed AkAd 3
637 BSCSE MATH 2183 Calculus and Linear Algebra A 603 603 Sat Tue 01:51:PM - 03:10:PM 01:51:PM - 03:10:PM Mohsina Rahman MoRhn 3
638 BSCSE MATH 2183 Calculus and Linear Algebra B 428 428 Sat Tue 03:11:PM - 04:30:PM 03:11:PM - 04:30:PM Mohammad Mahmudul Hasan Chowdhury MMHC 3
639 BSCSE MATH 2183 Calculus and Linear Algebra C 631 631 Sat Tue 11:11:AM - 12:30:PM 11:11:AM - 12:30:PM Nazmul Hasan NzHn 3
640 BSCSE MATH 2183 Calculus and Linear Algebra D 630 630 Sat Tue 12:31:PM - 01:50:PM 12:31:PM - 01:50:PM Mohammad Mahmudul Hasan Chowdhury MMHC 3
641 BSCSE MATH 2183 Calculus and Linear Algebra E 604 604 Sat Tue 01:51:PM - 03:10:PM 01:51:PM - 03:10:PM Md. Asadujjaman MdAsn 3
642 BSCSE MATH 2183 Calculus and Linear Algebra F 631 631 Sat Tue 09:51:AM - 11:10:AM 09:51:AM - 11:10:AM Mohsina Rahman MoRhn 3
643 BSCSE MATH 2183 Calculus and Linear Algebra G 604 604 Sun Wed 03:11:PM - 04:30:PM 03:11:PM - 04:30:PM Alvi Ahmed Sarker AAS 3
644 BSCSE MATH 2183 Calculus and Linear Algebra H 605 605 Sun Wed 08:30:AM - 09:50:AM 08:30:AM - 09:50:AM Saidul Islam SIsm 3
645 BSCSE MATH 2183 Calculus and Linear Algebra I 601 601 Sun Wed 09:51:AM - 11:10:AM 09:51:AM - 11:10:AM Jashodhan Saha JAS 3
646 BSCSE MATH 2183 Calculus and Linear Algebra J 602 602 Sun Wed 11:11:AM - 12:30:PM 11:11:AM - 12:30:PM Ashek Ahmed AkAd 3
647 BSCSE MATH 2183 Calculus and Linear Algebra K 604 604 Sun Wed 12:31:PM - 01:50:PM 12:31:PM - 01:50:PM Alvi Ahmed Sarker AAS 3
648 BSCSE MATH 2183 Calculus and Linear Algebra L 604 604 Sun Wed 01:51:PM - 03:10:PM 01:51:PM - 03:10:PM Md. Mehedi Hasan MMeHn 3
649 BSCSE MATH 2201 Coordinate Geometry and Vector Analysis A 631 631 Sat Tue 08:30:AM - 09:50:AM 08:30:AM - 09:50:AM Nazia Shifa Mugdha NSM 3
650 BSCSE MATH 2201 Coordinate Geometry and Vector Analysis B 429 429 Sat Tue 03:11:PM - 04:30:PM 03:11:PM - 04:30:PM Ashek Ahmed AkAd 3
651 BSCSE MATH 2201 Coordinate Geometry and Vector Analysis C 632 632 Sat Tue 11:11:AM - 12:30:PM 11:11:AM - 12:30:PM Muhaiminul Islam Adnan MIA 3
652 BSCSE MATH 2201 Coordinate Geometry and Vector Analysis D 605 605 Sat Tue 01:51:PM - 03:10:PM 01:51:PM - 03:10:PM Nazia Shifa Mugdha NSM 3
653 BSCSE MATH 2201 Coordinate Geometry and Vector Analysis E 630 630 Sat Tue 01:51:PM - 03:10:PM 01:51:PM - 03:10:PM Nazmul Hasan NzHn 3
654 BSCSE MATH 2201 Coordinate Geometry and Vector Analysis F 431 431 Sat Tue 03:11:PM - 04:30:PM 03:11:PM - 04:30:PM Tanveer Ahmed Khan Fahim TAKF 3
655 BSCSE MATH 2201 Coordinate Geometry and Vector Analysis G 630 630 Sun Wed 08:30:AM - 09:50:AM 08:30:AM - 09:50:AM Nazmul Hasan NzHn 3
656 BSCSE MATH 2201 Coordinate Geometry and Vector Analysis H 602 602 Sun Wed 09:51:AM - 11:10:AM 09:51:AM - 11:10:AM Muhaiminul Islam Adnan MIA 3
657 BSCSE MATH 2201 Coordinate Geometry and Vector Analysis I 603 603 Sun Wed 11:11:AM - 12:30:PM 11:11:AM - 12:30:PM Muhaiminul Islam Adnan MIA 3
658 BSCSE MATH 2201 Coordinate Geometry and Vector Analysis J 605 605 Sun Wed 12:31:PM - 01:50:PM 12:31:PM - 01:50:PM Jashodhan Saha JAS 3
659 BSCSE MATH 2201 Coordinate Geometry and Vector Analysis K 605 605 Sun Wed 01:51:PM - 03:10:PM 01:51:PM - 03:10:PM Nazmul Hasan NzHn 3
660 BSCSE MATH 2205 Probability and Statistics A 432 432 Sat Tue 03:11:PM - 04:30:PM 03:11:PM - 04:30:PM Rion Rion 3
661 BSCSE MATH 2205 Probability and Statistics B 601 601 Sat Tue 03:11:PM - 04:30:PM 03:11:PM - 04:30:PM Nazmul Hasan NzHn 3
662 BSCSE MATH 2205 Probability and Statistics C 631 631 Sat Tue 12:31:PM - 01:50:PM 12:31:PM - 01:50:PM Jashodhan Saha JAS 3
663 BSCSE MATH 2205 Probability and Statistics D 632 632 Sat Tue 12:31:PM - 01:50:PM 12:31:PM - 01:50:PM Sobur Sobur 3
664 BSCSE MATH 2205 Probability and Statistics E 631 631 Sat Tue 01:51:PM - 03:10:PM 01:51:PM - 03:10:PM Mahtab Uddin MUn 3
665 BSCSE MATH 2205 Probability and Statistics F 602 602 Sat Tue 03:11:PM - 04:30:PM 03:11:PM - 04:30:PM Sobur Sobur 3
666 BSCSE MATH 2205 Probability and Statistics N 604 604 Sun Wed 09:51:AM - 11:10:AM 09:51:AM - 11:10:AM Sumaiya Tarannum SuT 3
667 BSCSE MATH 2205 Probability and Statistics L 701 701 Sat Tue 12:31:PM - 01:50:PM 12:31:PM - 01:50:PM Rion Rion 3
668 BSCSE MATH 2205 Probability and Statistics G 630 630 Sun Wed 01:51:PM - 03:10:PM 01:51:PM - 03:10:PM Sumaiya Tarannum SuT 3
669 BSCSE MATH 2205 Probability and Statistics H 605 605 Sun Wed 03:11:PM - 04:30:PM 03:11:PM - 04:30:PM Rion Rion 3
670 BSCSE MATH 2205 Probability and Statistics I 603 603 Sun Wed 09:51:AM - 11:10:AM 09:51:AM - 11:10:AM Rion Rion 3
671 BSCSE MATH 2205 Probability and Statistics J 630 630 Sun Wed 12:31:PM - 01:50:PM 12:31:PM - 01:50:PM Md. Mutasim Billah Kouser MMBK 3
672 BSCSE MATH 2205 Probability and Statistics K 632 632 Sat Tue 08:30:AM - 09:50:AM 08:30:AM - 09:50:AM Sobur Sobur 3
673 BSCSE MATH 2205 Probability and Statistics M 604 604 Sun Wed 11:11:AM - 12:30:PM 11:11:AM - 12:30:PM Saidul Islam SIsm 3
674 BSCSE PHY 2105 Physics A 603 603 Sat Tue 03:11:PM - 04:30:PM 03:11:PM - 04:30:PM RaAN RaAN 3
675 BSCSE PHY 2105 Physics B 632 632 Sat Tue 09:51:AM - 11:10:AM 09:51:AM - 11:10:AM Sagar Dutta SaDa 3
676 BSCSE PHY 2105 Physics C 604 604 Sat Tue 03:11:PM - 04:30:PM 03:11:PM - 04:30:PM Md. Saiful Islam MSIs 3
677 BSCSE PHY 2105 Physics E 632 632 Sat Tue 01:51:PM - 03:10:PM 01:51:PM - 03:10:PM S.M. Hasibul Hassan Rizvee HaHR 3
678 BSCSE PHY 2105 Physics F 701 701 Sat Tue 08:30:AM - 09:50:AM 08:30:AM - 09:50:AM S.M. Hasibul Hassan Rizvee HaHR 3
679 BSCSE PHY 2105 Physics G 631 631 Sun Wed 01:51:PM - 03:10:PM 01:51:PM - 03:10:PM Taherin Taherin 3
680 BSCSE PHY 2105 Physics N 631 631 Sun Wed 08:30:AM - 09:50:AM 08:30:AM - 09:50:AM Sagar Dutta SaDa 3
681 BSCSE PHY 2105 Physics O 631 631 Sun Wed 03:11:PM - 04:30:PM 03:11:PM - 04:30:PM S.M. Hasibul Hassan Rizvee HaHR 3
682 BSCSE PHY 2105 Physics P 630 630 Sun Wed 09:51:AM - 11:10:AM 09:51:AM - 11:10:AM Arafat Arafat 3
683 BSCSE PHY 2105 Physics D 702 702 Sat Tue 12:31:PM - 01:50:PM 12:31:PM - 01:50:PM Md. Saiful Islam MSIs 3
684 BSCSE PHY 2105 Physics H 630 630 Sun Wed 03:11:PM - 04:30:PM 03:11:PM - 04:30:PM Badhan Badhan 3
685 BSCSE PHY 2105 Physics I 605 605 Sun Wed 09:51:AM - 11:10:AM 09:51:AM - 11:10:AM Md. Asaduzzaman MAn 3
686 BSCSE PHY 2105 Physics J 605 605 Sun Wed 11:11:AM - 12:30:PM 11:11:AM - 12:30:PM Golam Mohammed Bhuiyan GMB 3
687 BSCSE PHY 2105 Physics K 631 631 Sun Wed 12:31:PM - 01:50:PM 12:31:PM - 01:50:PM Golam Mohammed Bhuiyan GMB 3
688 BSCSE PHY 2105 Physics L 701 701 Sat Tue 09:51:AM - 11:10:AM 09:51:AM - 11:10:AM Taherin Taherin 3
689 BSCSE PHY 2105 Physics M 701 701 Sat Tue 11:11:AM - 12:30:PM 11:11:AM - 12:30:PM Badhan Badhan 3
690 BSCSE PHY 2106 Physics Laboratory A 510 (Physics Lab) Sat 08:30:AM - 11:00:AM - Arafat Arafat 1
691 BSCSE PHY 2106 Physics Laboratory B 510 (Physics Lab) Sat 11:11:AM - 01:40:PM - S.M. Hasibul Hassan Rizvee HaHR 1
692 BSCSE PHY 2106 Physics Laboratory C 510 (Physics Lab) Sat 02:00:PM - 04:30:PM - Taherin Taherin 1
693 BSCSE PHY 2106 Physics Laboratory D 704 (Physics Lab) Sat 02:00:PM - 04:30:PM - Badhan Badhan 1
694 BSCSE PHY 2106 Physics Laboratory E 510 (Physics Lab) Sun 08:30:AM - 11:00:AM - Md. Asaduzzaman MAn 1
695 BSCSE PHY 2106 Physics Laboratory F 510 (Physics Lab) Sun 11:11:AM - 01:40:PM - Arafat Arafat 1
696 BSCSE PHY 2106 Physics Laboratory H 510 (Physics Lab) Wed 02:00:PM - 04:30:PM - Md. Asaduzzaman MAn 1
697 BSCSE PHY 2106 Physics Laboratory I 510 (Physics Lab) Sun 02:00:PM - 04:30:PM - Md. Saiful Islam MSIs 1
698 BSCSE PHY 2106 Physics Laboratory J 704 (Physics Lab) Sun 08:30:AM - 11:00:AM - Taherin Taherin 1
699 BSCSE PHY 2106 Physics Laboratory K 510 (Physics Lab) Tue 08:30:AM - 11:00:AM - Badhan Badhan 1
700 BSCSE PHY 2106 Physics Laboratory G 704 (Physics Lab) Wed 11:11:AM - 01:40:PM - Rahil Afzal Nihal RaAN 1
701 BSCSE PMG 4101 Project Management A 702 702 Sat Tue 08:30:AM - 09:50:AM 08:30:AM - 09:50:AM Md. Muhyminul Haque MdMH 3
702 BSCSE PMG 4101 Project Management B 605 605 Sat Tue 03:11:PM - 04:30:PM 03:11:PM - 04:30:PM Syed Samin Sadaf SSSf 3
703 BSCSE PMG 4101 Project Management C 702 702 Sat Tue 11:11:AM - 12:30:PM 11:11:AM - 12:30:PM Rizvan Jawad Ruhan RJR 3
704 BSCSE PMG 4101 Project Management D 701 701 Sat Tue 01:51:PM - 03:10:PM 01:51:PM - 03:10:PM Mr. Syed Tauhid Zuhori Mr. Syed Tauhid Zuhori 3
705 BSCSE PMG 4101 Project Management E 632 632 Sun Wed 08:30:AM - 09:50:AM 08:30:AM - 09:50:AM Rizvan Jawad Ruhan RJR 3
706 BSCSE PMG 4101 Project Management F 631 631 Sun Wed 09:51:AM - 11:10:AM 09:51:AM - 11:10:AM Nahin F. Siddiqui NaFS 3
707 BSCSE PMG 4101 Project Management G 630 630 Sun Wed 11:11:AM - 12:30:PM 11:11:AM - 12:30:PM Nahin F. Siddiqui NaFS 3
708 BSCSE PMG 4101 Project Management H 632 632 Sun Wed 01:51:PM - 03:10:PM 01:51:PM - 03:10:PM Rizvan Jawad Ruhan RJR 3
709 BSCSE PMG 4101 Project Management I 632 632 Sun Wed 03:11:PM - 04:30:PM 03:11:PM - 04:30:PM Syed Samin Sadaf SSSf 3
710 BSCSE PMG 4101 Project Management J 632 632 Sun Wed 12:31:PM - 01:50:PM 12:31:PM - 01:50:PM Md. Muhyminul Haque MdMH 3
711 BSCSE PMG 4101 Project Management K 703 703 Sat Tue 12:31:PM - 01:50:PM 12:31:PM - 01:50:PM Syed Samin Sadaf SSSf 3
712 BSCSE PMG 4101 Project Management L 630 630 Sat Tue 03:11:PM - 04:30:PM 03:11:PM - 04:30:PM Ms. Sumaiya Ahmed Rani Ms. Sumaiya Ahmed Rani 3
713 BSCSE SOC 2101 Society, Environment and Engineering Ethics A 631 631 Sat Tue 03:11:PM - 04:30:PM 03:11:PM - 04:30:PM Sadia Zaman SZn 3
714 BSCSE SOC 2101 Society, Environment and Engineering Ethics B 702 702 Sat Tue 09:51:AM - 11:10:AM 09:51:AM - 11:10:AM Nazmun Nahar Showmi NNS 3
715 BSCSE SOC 2101 Society, Environment and Engineering Ethics C 703 703 Sat Tue 11:11:AM - 12:30:PM 11:11:AM - 12:30:PM Taniah Mahmuda Tinni TMT 3
716 BSCSE SOC 2101 Society, Environment and Engineering Ethics D 706 706 Sat Tue 12:31:PM - 01:50:PM 12:31:PM - 01:50:PM TBA TBA 3
717 BSCSE SOC 2101 Society, Environment and Engineering Ethics E 702 702 Sat Tue 01:51:PM - 03:10:PM 01:51:PM - 03:10:PM TBA TBA 3
718 BSCSE SOC 2101 Society, Environment and Engineering Ethics F 701 701 Sun Wed 08:30:AM - 09:50:AM 08:30:AM - 09:50:AM Taniah Mahmuda Tinni TMT 3
719 BSCSE SOC 2101 Society, Environment and Engineering Ethics G 632 632 Sun Wed 09:51:AM - 11:10:AM 09:51:AM - 11:10:AM Nabila Sultana NaSa 3
720 BSCSE SOC 2101 Society, Environment and Engineering Ethics H 631 631 Sun Wed 11:11:AM - 12:30:PM 11:11:AM - 12:30:PM Rusafa Islam Aurchi RIA 3
721 BSCSE SOC 2101 Society, Environment and Engineering Ethics I 701 701 Sun Wed 03:11:PM - 04:30:PM 03:11:PM - 04:30:PM Md. Minhajul Islam MMiIm 3
722 BSCSE SOC 2101 Society, Environment and Engineering Ethics J 701 701 Sun Wed 01:51:PM - 03:10:PM 01:51:PM - 03:10:PM Md. Minhajul Islam MMiIm 3
723 BSCSE TEC 2499 Technology Entrepreneurship A Sat Tue 09:51:AM - 11:10:AM 09:51:AM - 11:10:AM Md. Anowarul Abedin MAnAn 3
724 BSDS BIO 3107 Biology BA 702 702 Sun Wed 03:11:PM - 04:30:PM 03:11:PM - 04:30:PM Md. Belal Hussain Ripon BHR 3
725 BSDS BIO 3107 Biology BB 707 707 Sat Tue 12:31:PM - 01:50:PM 12:31:PM - 01:50:PM S.M. Rafiqul Islam SMRI 3
726 BSDS CSE 2215 Data Structure and Algorithms I BA 706 706 Sat Tue 09:51:AM - 11:10:AM 09:51:AM - 11:10:AM Kazi Fahim Tahmid KFT 3
727 BSDS CSE 2215 Data Structure and Algorithms I BB 701 701 Sun Wed 12:31:PM - 01:50:PM 12:31:PM - 01:50:PM Kazi Fahim Tahmid KFT 3
728 BSDS CSE 2216 Data Structure and Algorithms I Laboratory BA 826 (Computer Lab) Sun 08:30:AM - 11:00:AM - Kazi Fahim Tahmid KFT 1
729 BSDS CSE 2216 Data Structure and Algorithms I Laboratory BB 926 (Computer Lab) Wed 08:30:AM - 11:00:AM - Kazi Fahim Tahmid KFT 1
730 BSDS CSE 2217 Data Structure and Algorithms II BA 706 706 Sat Tue 11:11:AM - 12:30:PM 11:11:AM - 12:30:PM Umama Rahman UR 3
731 BSDS CSE 2217 Data Structure and Algorithms II BB 702 702 Sun Wed 08:30:AM - 09:50:AM 08:30:AM - 09:50:AM Umama Rahman UR 3
732 BSDS CSE 2218 Data Structure and Algorithms II Laboratory BA 826 (Computer Lab) Sun 02:00:PM - 04:30:PM - Umama Rahman UR 1
733 BSDS CSE 2218 Data Structure and Algorithms II Laboratory BB 727 (Computer Lab) Wed 02:00:PM - 04:30:PM - Umama Rahman UR 1
734 BSDS CSE 3521 Database Management Systems BA 703 703 Sun Wed 03:11:PM - 04:30:PM 03:11:PM - 04:30:PM Shihab Ahmed ShAhd 3
735 BSDS CSE 3521 Database Management Systems BB 703 703 Sat Tue 08:30:AM - 09:50:AM 08:30:AM - 09:50:AM Shihab Ahmed ShAhd 3
736 BSDS CSE 3522 Database Management Systems Laboratory BA 826 (Computer Lab) Sat 11:11:AM - 01:40:PM - Didarul Islam Didar DID 1
737 BSDS CSE 3522 Database Management Systems Laboratory BB 926 (Computer Lab) Tue 11:11:AM - 01:40:PM - Didarul Islam Didar DID 1
738 BSDS DS 1101 Fundamentals of Data Science BA 707 707 Sat Tue 11:11:AM - 12:30:PM 11:11:AM - 12:30:PM Samin Sharaf Somik SSSk 3
739 BSDS DS 1101 Fundamentals of Data Science BB 703 703 Sun Wed 08:30:AM - 09:50:AM 08:30:AM - 09:50:AM Samin Sharaf Somik SSSk 3
740 BSDS DS 1115 Object Oriented Programming for Data Science BA 706 706 Sat Tue 08:30:AM - 09:50:AM 08:30:AM - 09:50:AM Md. Romizul Islam MdRIm 3
741 BSDS DS 1115 Object Oriented Programming for Data Science BB 702 702 Sun Wed 12:31:PM - 01:50:PM 12:31:PM - 01:50:PM Md. Romizul Islam MdRIm 3
742 BSDS DS 1115 Object Oriented Programming for Data Science BC 632 632 Sat Tue 03:11:PM - 04:30:PM 03:11:PM - 04:30:PM Rakibul Hasan Rafi RaHR 3
743 BSDS DS 1115 Object Oriented Programming for Data Science BD 632 632 Sun Wed 11:11:AM - 12:30:PM 11:11:AM - 12:30:PM Md. Romizul Islam MdRIm 3
744 BSDS DS 1116 Object Oriented Programming for Data Science Laboratory BA 827 (Computer Lab) Sun 08:30:AM - 11:00:AM - Rakibul Hasan Rafi RaHR 1
745 BSDS DS 1116 Object Oriented Programming for Data Science Laboratory BB 522 (Computer Lab) Wed 08:30:AM - 11:00:AM - Mr. Mabsur Fatin Bin Hossain Mr. Mabsur Fatin Bin Hossain 1
746 BSDS DS 1116 Object Oriented Programming for Data Science Laboratory BC 827 (Computer Lab) Sat 11:11:AM - 01:40:PM - Md. Romizul Islam MdRIm 1
747 BSDS DS 1116 Object Oriented Programming for Data Science Laboratory BD 927 (Computer Lab) Wed 11:11:AM - 01:40:PM - Rakibul Hasan Rafi RaHR 1
748 BSDS DS 1116 Object Oriented Programming for Data Science Laboratory BE 827 (Computer Lab) Tue 02:00:PM - 04:30:PM - Md. Romizul Islam MdRIm 1
749 BSDS DS 1501 Programming for Data Science BA 701 701 Sun Wed 09:51:AM - 11:10:AM 09:51:AM - 11:10:AM Syed Abu Ammar Muhammad Zarif SAMZ 3
750 BSDS DS 1501 Programming for Data Science BB (If Required) 708 708 Sat Tue 12:31:PM - 01:50:PM 12:31:PM - 01:50:PM TBA TBA 3
751 BSDS DS 1501 Programming for Data Science BC 703 703 Sat Tue 01:51:PM - 03:10:PM 01:51:PM - 03:10:PM Siana Rizwan SnRn 3
752 BSDS DS 1501 Programming for Data Science BD 701 701 Sun Wed 11:11:AM - 12:30:PM 11:11:AM - 12:30:PM Syed Abu Ammar Muhammad Zarif SAMZ 3
753 BSDS DS 1501 Programming for Data Science BE 707 707 Sat Tue 08:30:AM - 09:50:AM 08:30:AM - 09:50:AM Mr. Mabsur Fatin Bin Hossain Mr. Mabsur Fatin Bin Hossain 3
754 BSDS DS 1502 Programming for Data Science Laboratory BA 626 (Computer Lab) Sat 08:30:AM - 11:00:AM - Syed Abu Ammar Muhammad Zarif SAMZ 1
755 BSDS DS 1502 Programming for Data Science Laboratory BB 926 (Computer Lab) Tue 08:30:AM - 11:00:AM - Mr. Masnoon Muztahid Mr. Masnoon Muztahid 1
756 BSDS DS 1502 Programming for Data Science Laboratory BC 726 (Computer Lab) Tue 11:11:AM - 01:40:PM - Md. Mehedi Hasan MdMeHn 1
757 BSDS DS 1502 Programming for Data Science Laboratory BD 826 (Computer Lab) Wed 02:00:PM - 04:30:PM - Syed Abu Ammar Muhammad Zarif SAMZ 1
758 BSDS DS 1502 Programming for Data Science Laboratory BE 827 (Computer Lab) Sun 02:00:PM - 04:30:PM - Md. Mehedi Hasan MdMeHn 1
759 BSDS DS 2251 Bayesian Statistics BA 702 702 Sun Wed 11:11:AM - 12:30:PM 11:11:AM - 12:30:PM Siana Rizwan SnRn 3
760 BSDS DS 3101 Advanced Probability and Statistics BA 702 702 Sun Wed 01:51:PM - 03:10:PM 01:51:PM - 03:10:PM Md. Zunaid-Ul-Alam MZUA 3
761 BSDS DS 3120 Technical Report Writing and Presentation BA 927 (Computer Lab) Sat 08:30:AM - 11:00:AM - Jannatun Noor Mukta JNM 2
762 BSDS DS 3120 Technical Report Writing and Presentation BB 926 (Computer Lab) Sun 02:00:PM - 04:30:PM - Al-Sakib Khan Pathan ASKP 2
763 BSDS DS 3521 Data Visualization BA 703 703 Sun Wed 11:11:AM - 12:30:PM 11:11:AM - 12:30:PM Shihab Ahmed ShAhd 3
764 BSDS DS 3521 Data Visualization BB 707 707 Sat Tue 09:51:AM - 11:10:AM 09:51:AM - 11:10:AM Shihab Ahmed ShAhd 3
765 BSDS DS 3522 Data Visualization Laboratory BA 926 (Computer Lab) Sun 08:30:AM - 11:00:AM - Shihab Ahmed ShAhd 1
766 BSDS DS 3522 Data Visualization Laboratory BB 926 (Computer Lab) Tue 02:00:PM - 04:30:PM - Shihab Ahmed ShAhd 1
767 BSDS DS 3881 Regression and Time Series Analysis BA 703 703 Sun Wed 12:31:PM - 01:50:PM 12:31:PM - 01:50:PM Siana Rizwan SnRn 3
768 BSDS DS 3885 Data Wrangling BA 711 711 Sat Tue 12:31:PM - 01:50:PM 12:31:PM - 01:50:PM Hafijul Hoque Chowdhury HHCh 3
769 BSDS DS 3885 Data Wrangling BB 702 702 Sun Wed 09:51:AM - 11:10:AM 09:51:AM - 11:10:AM Hafijul Hoque Chowdhury HHCh 3
770 BSDS DS 4000A Capstone Project - I BA 827 (Computer Lab) Wed 02:00:PM - 04:30:PM - Md. Shohrab Hossain MShH 2
771 BSDS DS 4115 Marketing Analytics BA 805 805 Sat Tue 12:31:PM - 01:50:PM 12:31:PM - 01:50:PM Mr. Syed Tauhid Zuhori Mr. Syed Tauhid Zuhori 3
772 BSDS DS 4115 Marketing Analytics BB 706 706 Sun Wed 03:11:PM - 04:30:PM 03:11:PM - 04:30:PM Mr. Syed Tauhid Zuhori Mr. Syed Tauhid Zuhori 3
773 BSDS DS 4123 Human Computer Interaction BA 706 706 Sun Wed 08:30:AM - 09:50:AM 08:30:AM - 09:50:AM Md. Sajjad Hossain MSdHn 3
774 BSDS DS 4211 Deep Learning BA 706 706 Sun Wed 12:31:PM - 01:50:PM 12:31:PM - 01:50:PM Asif Abrar AsAr 3
775 BSDS DS 4213 Natural Language Processing BA 708 708 Sat Tue 08:30:AM - 09:50:AM 08:30:AM - 09:50:AM Muhammad Anwarul Azim MAnAm 3
776 BSDS DS 4213 Natural Language Processing BB 707 707 Sun Wed 12:31:PM - 01:50:PM 12:31:PM - 01:50:PM Muhammad Anwarul Azim MAnAm 3
777 BSDS DS 4217 Data Privacy and Ethics BA 701 701 Sat Tue 03:11:PM - 04:30:PM 03:11:PM - 04:30:PM Al-Sakib Khan Pathan ASKP 3
778 BSDS DS 4217 Data Privacy and Ethics BB 703 703 Sun Wed 09:51:AM - 11:10:AM 09:51:AM - 11:10:AM Al-Sakib Khan Pathan ASKP 3
779 BSDS DS 4229 Data Warehousing BA 702 702 Sat Tue 03:11:PM - 04:30:PM 03:11:PM - 04:30:PM Hafijul Hoque Chowdhury HHCh 3
780 BSDS DS 4491 Machine Learning Systems Design BA 711 711 Sat Tue 08:30:AM - 09:50:AM 08:30:AM - 09:50:AM Asif Abrar AsAr 3
781 BSDS DS 4523 Simulation and Modeling BA 703 703 Sat Tue 03:11:PM - 04:30:PM 03:11:PM - 04:30:PM Asif Ahmed Utsa AAU 3
782 BSDS DS 4817 Big Data BA 707 707 Sun Wed 08:30:AM - 09:50:AM 08:30:AM - 09:50:AM Dewan Md. Farid DMF 3
783 BSDS DS 4817 Big Data BB 706 706 Sun Wed 11:11:AM - 12:30:PM 11:11:AM - 12:30:PM Dewan Md. Farid DMF 3
784 BSDS DS 4889 Machine Learning BA 722 722 Sat Tue 12:31:PM - 01:50:PM 12:31:PM - 01:50:PM Kazi Fahim Tahmid KFT 3
785 BSDS DS 4891 Data Analytics BA 708 708 Sun Wed 08:30:AM - 09:50:AM 08:30:AM - 09:50:AM Md. Mushfiqul Haque Omi MHO 3
786 BSDS DS 4891 Data Analytics BB 708 708 Sat Tue 11:11:AM - 12:30:PM 11:11:AM - 12:30:PM Md. Mushfiqul Haque Omi MHO 3
787 BSDS DS 4892 Data Analytics Laboratory BA 626 (Computer Lab) Tue 08:30:AM - 11:00:AM - Md. Mushfiqul Haque Omi MHO 1
788 BSDS DS 4892 Data Analytics Laboratory BB 926 (Computer Lab) Wed 02:00:PM - 04:30:PM - Md. Mushfiqul Haque Omi MHO 1
789 BSDS MATH 1153 Advanced Calculus BA 707 707 Sun Wed 11:11:AM - 12:30:PM 11:11:AM - 12:30:PM Mahtab Uddin MUn 3
790 BSDS MATH 2107 Linear Algebra BA 703 703 Sun Wed 01:51:PM - 03:10:PM 01:51:PM - 03:10:PM Ashek Ahmed AkAd 3
791 BSDS MATH 2107 Linear Algebra BB 706 706 Sat Tue 01:51:PM - 03:10:PM 01:51:PM - 03:10:PM Ashek Ahmed AkAd 3
"""

day_map = {
    'Sat': 'Saturday',
    'Sun': 'Sunday',
    'Mon': 'Monday',
    'Tue': 'Tuesday',
    'Wed': 'Wednesday',
    'Thu': 'Thursday',
    'Fri': 'Friday'
}

def clean_time_str(time_str):
    if not time_str or time_str.strip() == '-' or 'TBA' in time_str:
        return None
    # standard format: 08:30:AM - 09:50:AM or 08:30 AM - 09:50 AM
    time_str = time_str.strip()
    return time_str

def parse_time_slot(time_str):
    # Returns (start_minutes, end_minutes, formatted_str)
    # e.g. "08:30:AM - 09:50:AM"
    if not time_str or '-' not in time_str:
        return None
    parts = time_str.split('-')
    if len(parts) != 2:
        return None
    
    def to_minutes(t_part):
        t_part = t_part.strip().replace(' ', '')
        m = re.match(r'(\d+):(\d+):?([AP]M)?', t_part, re.IGNORECASE)
        if not m:
            return 0
        hours = int(m.group(1))
        mins = int(m.group(2))
        ampm = m.group(3)
        if ampm:
            ampm = ampm.upper()
            if ampm == 'PM' and hours != 12:
                hours += 12
            elif ampm == 'AM' and hours == 12:
                hours = 0
        return hours * 60 + mins

    start_m = to_minutes(parts[0])
    end_m = to_minutes(parts[1])
    return {
        'startMinutes': start_m,
        'endMinutes': end_m,
        'raw': time_str.strip()
    }

parsed_rows = []
lines = [l.strip() for l in ocr_text.strip().split('\n') if l.strip()]

for line in lines:
    day_m = re.search(r'\s+(Sat|Sun|Mon|Tue|Wed)(?:\s+(Sat|Sun|Mon|Tue|Wed))?\s+', line)
    if not day_m:
        print("Failed to find days in line:", line)
        continue
    
    day1 = day_m.group(1)
    day2 = day_m.group(2) if day_m.group(2) else ""
    
    pre_days = line[:day_m.start()].strip()
    post_days = line[day_m.end():].strip()
    
    m_head = re.match(r'^(\d+)\s+(BSCSE|BSDS)\s+([A-Z]{2,5}\s+\d{3,4}[A-Z]?)\s+(.*)$', pre_days)
    if not m_head:
        print("Failed to match head:", pre_days)
        continue
        
    sl = int(m_head.group(1))
    program = m_head.group(2)
    course_code = m_head.group(3)
    middle = m_head.group(4).strip()
    
    room_m = re.search(r'(\d{3}(?:\s*\([^\)]+\))?(?:\s+\d{3}(?:\s*\([^\)]+\))?)?)$', middle)
    if room_m:
        rooms = room_m.group(1).strip()
        title_and_sec = middle[:room_m.start()].strip()
    else:
        rooms = ''
        title_and_sec = middle
        
    sec_m = re.search(r'\s+([A-Z0-9]{1,3}(?:\s+\(if\s+required\))?)$', title_and_sec, re.IGNORECASE)
    if sec_m:
        sec = sec_m.group(1).strip()
        course_title = title_and_sec[:sec_m.start()].strip()
    else:
        sec = 'A'
        course_title = title_and_sec
        
    credit_m = re.search(r'\s+(\d+)$', post_days)
    if credit_m:
        credit = int(credit_m.group(1))
        post_days_no_credit = post_days[:credit_m.start()].strip()
    else:
        credit = 3
        post_days_no_credit = post_days
        
    time_matches = list(re.finditer(r'(\d{2}:\d{2}:[AP]M\s*-\s*\d{2}:\d{2}:[AP]M)', post_days_no_credit))
    if not time_matches:
        time1 = ""
        time2 = ""
        faculty_part = post_days_no_credit
    elif len(time_matches) >= 2:
        time1 = time_matches[0].group(1)
        time2 = time_matches[1].group(1)
        faculty_part = post_days_no_credit[time_matches[1].end():].strip()
    else:
        time1 = time_matches[0].group(1)
        time2 = "-"
        faculty_part = post_days_no_credit[time_matches[0].end():].strip()
        if faculty_part.startswith('-'):
            faculty_part = faculty_part[1:].strip()
            
    fac_tokens = faculty_part.split()
    if len(fac_tokens) >= 2:
        fac_initial = fac_tokens[-1]
        fac_name = " ".join(fac_tokens[:-1])
    else:
        fac_initial = faculty_part or "TBA"
        fac_name = faculty_part or "TBA"
        
    # Rooms breakdown
    sub_rooms = re.findall(r'(\d{3}(?:\s*\([^\)]+\))?)', rooms)
    if len(sub_rooms) >= 2:
        room1 = sub_rooms[0]
        room2 = sub_rooms[1]
    elif len(sub_rooms) == 1:
        room1 = sub_rooms[0]
        room2 = sub_rooms[0]
    else:
        room1 = rooms or "TBA"
        room2 = rooms or "TBA"
        
    is_lab = 'Laboratory' in course_title or 'Lab' in course_title or 'Lab' in room1 or credit == 1 or (credit == 2 and 'Project' not in course_title)

    schedules = []
    t1_info = parse_time_slot(time1)
    if day1 and t1_info:
        schedules.append({
            'day': day_map.get(day1, day1),
            'dayCode': day1,
            'time': time1,
            'startMinutes': t1_info['startMinutes'],
            'endMinutes': t1_info['endMinutes'],
            'room': room1
        })
    
    t2_info = parse_time_slot(time2 if time2 != '-' else time1)
    if day2 and t2_info:
        schedules.append({
            'day': day_map.get(day2, day2),
            'dayCode': day2,
            'time': time2 if time2 != '-' else time1,
            'startMinutes': t2_info['startMinutes'],
            'endMinutes': t2_info['endMinutes'],
            'room': room2
        })

    row_data = {
        'id': f"{course_code.replace(' ', '_')}_{sec.replace(' ', '_')}_{sl}",
        'sl': sl,
        'program': program,
        'courseCode': course_code,
        'courseTitle': course_title,
        'section': sec,
        'room1': room1,
        'room2': room2,
        'day1': day1,
        'day2': day2,
        'time1': time1,
        'time2': time2,
        'facultyName': fac_name,
        'facultyInitial': fac_initial,
        'credit': credit,
        'isLab': is_lab,
        'schedules': schedules
    }
    parsed_rows.append(row_data)

print(f"Successfully parsed {len(parsed_rows)} sections!")

with open("src/data/routineData.json", "w") as out_f:
    json.dump(parsed_rows, out_f, indent=2)

print("Saved to src/data/routineData.json")

