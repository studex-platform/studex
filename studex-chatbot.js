/**
 * StudeX — المساعد الذكي (Smart Chatbot Widget)
 *
 * ملف مستقل بالكامل: يحقن CSS والواجهة بنفسه، ولا يعدّل أي كود أو تصميم موجود.
 * التفعيل في أي صفحة بسطر واحد قبل </body>:
 *     <script src="studex-chatbot.js" defer></script>
 *
 * - زر عائم أسفل اليسار + نافذة محادثة.
 * - يتبع الوضع الليلي الحالي للموقع تلقائياً (الكلاس "dark" على <html>).
 * - قاعدة المعرفة محلية بالكامل (المصفوفة KB أدناه) — لإضافة جواب جديد
 *   أضف عنصراً جديداً بنفس الشكل: { id, kw: [كلمات مفتاحية], text, links }.
 * - الروابط من النوع academic-resources.html?open=ai_tools تفتح نافذة القسم
 *   مباشرة (باستخدام openItemsModal الموجودة أصلاً في الصفحة).
 */
(function () {
  'use strict';

  if (typeof window !== 'undefined' && window.__studexChatbotLoaded) return;

  /* ============================================================
   *  قاعدة المعرفة المحلية — عدّلها بحرية
   * ============================================================ */
  var KB = [
    {
      id: 'gpa',
      kw: ['معدل', 'معدلي', 'حاسبة المعدل', 'حساب المعدل', 'المعدل التراكمي', 'تراكمي', 'gpa', 'ساعات معتمدة', 'علامات', 'كم معدلي'],
      text: ['تقدر تحسب معدلك التراكمي بدقة عبر حاسبة معدل الجامعة الأردنية الموجودة في المنصة.'],
      links: [{ t: 'حاسبة المعدل', u: 'gpa-calculator.html' }]
    },
    {
      id: 'planning',
      kw: ['لوحة التخطيط', 'تخطيط', 'خطة الفصل', 'خطه', 'جدول', 'كانبان', 'kanban', 'miro', 'ميرو', 'مهام', 'تنظيم', 'planner', 'planning', 'ترتيب دراستي'],
      text: ['لوحة التخطيط التفاعلية تساعدك تنظّم فصلك الدراسي ومهامك على لوحة شبيهة بـ Miro.'],
      links: [{ t: 'لوحة التخطيط التفاعلية', u: 'planning-board.html' }]
    },
    {
      id: 'materials',
      kw: ['مصادر', 'مصادر المواد', 'مواد', 'سلايدات', 'ملخصات', 'ملازم', 'نوتس', 'slides', 'بنك اسئلة', 'بنك الاسئلة', 'اسئلة سنوات', 'سنوات سابقة', 'سنوات سابقه', 'past papers', 'امتحانات', 'امتحان', 'فاينل', 'ميد', 'اختبار'],
      text: ['مصادر المواد والسلايدات وأسئلة السنوات السابقة كلها مجمّعة بقسم واحد في صفحة المصادر الأكاديمية.'],
      links: [
        { t: 'مصادر المواد والسلايدات وأسئلة السنوات', u: 'academic-resources.html?open=slides' },
        { t: 'صفحة المصادر الأكاديمية', u: 'academic-resources.html' }
      ]
    },
    {
      id: 'stu101', boost: 6, group: 'platforms',
      kw: [
        'student 101', 'stu101', 'ستيودنت 101', 'ستودنت 101', 'ستوديت 101',
        /* متطلبات الجامعة */
        'متطلبات الجامعة', 'متطلبات جامعة', 'متطلبات الجامعه', 'اخلاق وقيم', 'اخلاق', 'ثقافة وطنية', 'علوم عسكرية', 'فلسفة', 'حضارة انسانية',
        'مهارات حياة', 'مهارات تواصل', 'مهارات رقمية', 'مهارات رقمية حديثة', 'مهارات الرقمية', 'مهارات التواصل', 'مهارات حياتية', 'المهارات الحياتية', 'وسائل التواصل الاجتماعي', 'ريادة وابتكار', 'ريادة', 'مهارات تعلم', 'بحث علمي', 'مهارات تعلم وبحث علمي',
        'تجارة الكترونية', 'وسائل تواصل اجتماعي', 'تذوق الفنون', 'لغات اجنبية', 'موضوع خاص',
        'ثقافة', 'ثقافة بيئية', 'ثقافة صحية', 'ثقافة اسلامية', 'ثقافة قانونية', 'ثقافة بدنية',
        'اسلام وقضايا العصر', 'حضارة عربية اسلامية', 'حضارة', 'الاردن تاريخ وحضارة', 'امهات الكتب', 'القصص',
        /* متطلبات إجبارية عامة (استدراكي + امتحانات المستوى) */
        'استدراكي', 'امتحان مستوى', 'امتحانات المستوى', 'مستوى عربي', 'مستوى انجليزي', 'مستوى حاسوب',
        'english', 'انجليزي', 'انجليزية', 'لغة انجليزية', 'حاسوب', 'الحاسوب', 'عربي', 'لغة عربية',
        /* متطلبات الكليات */
        'متطلبات الكليات', 'متطلبات كلية', 'كلية الشريعة', 'الشريعة', 'كلية العلوم', 'علوم', 'كلية الهندسة', 'هندسة',
        'كلية التربية', 'تربية', 'كلية الزراعة', 'زراعة', 'كلية it', 'كلية تكنولوجيا المعلومات', 'تكنولوجيا المعلومات',
        /* مقترحات: المواد */
        'calculus', 'calculus 1', 'calculus 2', 'calculus 3', 'كالكولس', 'كالكولاس', 'كالكلوس', 'كالكلس', 'كالكولوس', 'calc', 'calc 1', 'calc 2', 'calc 3', 'تفاضل', 'تفاضل وتكامل', 'رياضيات',
        'chemistry', 'chemistry 1', 'chemistry 2', 'chemistry 1 lab', 'كيمياء', 'كيميا', 'chem', 'chem 1', 'chem 2', 'كيمياء 1', 'كيمياء 2', 'كيمياء عملي',
        'physics', 'physics 1', 'physics 2', 'physics 103', 'physics 1 lab', 'physics 2 lab', 'فيزياء', 'فيزيا', 'فزياء', 'فزيا', 'phys', 'phys 1', 'phys 2', 'فيزياء 1', 'فيزياء 2', 'فيزياء 103', 'فيزياء عملي',
        'bio', 'bio 1', 'bio 1 lab', 'biology', 'احياء', 'علم الاحياء', 'بيولوجي', 'بيولوجيا', 'بايولوجي', 'بايولوجيا',
        'geo', 'geo 1', 'geology', 'جيولوجيا', 'جيولوجي',
        'c++', 'cpp', 'سي بلس', 'c plus plus', 'سي بلس بلس',
        'الرسم الهندسي', 'رسم هندسي', 'الهندسة الوصفية', 'هندسة وصفية',
        'مهارات حاسوبية', 'المهارات الحاسوبية', 'مهارات حاسوب', 'مهارات حاسوبية للكليات الانسانية', 'كليات انسانية'
      ],
      text: ['كل المصادر والشروحات الخاصة بهذه المادة أو المتطلب موجودة عند منصة Student 101، انتقل لها مباشرة من الرابط:'],
      links: [{ t: 'افتح منصة Student 101', u: 'https://www.stu101.com' }]
    },
    {
      id: 'alhemmeh', boost: 6, group: 'platforms',
      kw: [
        'منصة الهمة', 'موقع الهمة', 'الهمة', 'alhemmeh', 'alhemmehju',
        /* متطلب إجباري جامعة */
        'المهارات الحياتية والعملية', 'مهارات حياتية', 'المهارات الحياتية', 'مهارات حياة',
        'الاخلاق والمسؤولية المجتمعية', 'اخلاق', 'مسؤولية مجتمعية',
        'الثقافة الوطنية', 'ثقافة وطنية',
        'الريادة والابتكار', 'ريادة وابتكار', 'ريادة',
        'العلوم العسكرية', 'علوم عسكرية',
        'المهارات الرقمية الحديثة', 'مهارات رقمية', 'مهارات الرقمية', 'مهارات رقمية حديثة',
        'مهارات التواصل الناعمة', 'مهارات التواصل', 'مهارات تواصل', 'تواصل ناعم',
        /* متطلب اختياري جامعة */
        'الاسلام وقضايا العصر', 'اسلام وقضايا العصر',
        'وسائل التواصل الاجتماعي', 'وسائل تواصل اجتماعي', 'وسائل تواصل',
        'مقدمة في الفلسفة والتفكير الناقد', 'فلسفة', 'تفكير ناقد', 'التفكير الناقد',
        'ثقافة', 'الثقافة السياسية', 'ثقافة سياسية', 'الثقافة البدنية', 'ثقافة بدنية', 'الثقافة البيئية', 'ثقافة بيئية',
        'الثقافة الاسلامية', 'ثقافة اسلامية', 'موضوع خاص', 'القدس',
        'متطلبات الجامعة', 'متطلبات جامعة', 'متطلب اجباري', 'متطلب اختياري', 'متطلب جامعة',
        /* متطلب إجباري عام */
        'مستويات اللغة الانجليزية', 'اساسيات اللغة الانجليزية', 'مهارات اللغة الانجليزية', 'لغة انجليزية', 'english', 'انجليزي', 'انجليزية',
        'مستويات اللغة العربية', 'اساسيات اللغة العربية', 'مهارات اللغة العربية', 'لغة عربية', 'عربي',
        'اساسيات الحاسوب', 'حاسوب', 'الحاسوب',
        'امتحانات المستوى', 'امتحان مستوى', 'مستوى عربي', 'مستوى انجليزي', 'مستوى حاسوب',
        'test bank', 'تست بانك', 'بنك اختبارات'
      ],
      text: ['كل التست بانك والكويزات والملخصات الخاصة بهذه المادة أو المتطلب موجودة عند منصة الهمة، انتقل لها مباشرة من الرابط:'],
      links: [{ t: 'افتح منصة الهمة', u: 'https://alhemmehju.com/' }]
    },
    {
      id: 'uniflix', boost: 6, group: 'platforms',
      kw: [
        'uniflix', 'uniflixjo', 'يونيفلكس', 'يوني فلكس', 'منصة يوني فلكس',
        /* الدورات */
        'adobe', 'ادوبي', 'adobe illustrator', 'illustrator', 'اليستريتور', 'اليستراتور', 'adobe photoshop', 'photoshop', 'فوتوشوب',
        'circuit', 'circuits', 'circuit 1', 'دوائر', 'دارات', 'دوائر كهربائية',
        'general physics', 'general physics 101', 'general physics 102', 'physics 101', 'physics 102', 'فيزياء 101', 'فيزياء 102', 'فيزياء عامة',
        'physics', 'phys', 'فيزياء', 'فيزيا', 'فزياء', 'physics 103', 'lab physics 103', 'فيزياء 103', 'فيزياء عملي',
        'chemistry', 'chem', 'كيمياء', 'كيميا', 'lab chemistry', 'chemistry lab', 'كيمياء عملي',
        'lab analytical', 'analytical', 'كيمياء تحليلية', 'تحليلية',
        'cost accounting', 'محاسبة التكاليف', 'محاسبة تكاليف', 'accounting', 'محاسبة',
        'human physiology', 'physiology', 'فسيولوجيا', 'فسيولوجي', 'practical',
        'human nutrition', 'sports nutrition', 'nutrition', 'تغذية', 'تغذية رياضية',
        'principles of macroeconomics', 'macroeconomics', 'macro', 'اقتصاد كلي', 'مبادئ الاقتصاد الكلي', 'اقتصاد',
        'public finance', 'المالية العامة', 'مالية عامة', 'finance', 'مالية',
        'testing', 'software testing', 'اختبار البرمجيات',
        /* الكليات */
        'كلية الاعمال', 'كلية التمريض', 'تمريض', 'كلية الزراعة', 'زراعة', 'كلية الشريعة', 'الشريعة',
        'كلية الصيدلة', 'صيدلة', 'كلية الطب', 'طب', 'كلية العلوم', 'كلية العلوم التربوية', 'علوم تربوية',
        'كلية الهندسة', 'هندسة', 'كلية طب الاسنان', 'طب اسنان', 'اسنان', 'كلية علوم التاهيل', 'علوم التاهيل',
        'كلية الملك عبدالله الثاني لتكنولوجيا المعلومات', 'تكنولوجيا المعلومات'
      ],
      text: ['كل الدورات والفيديوهات الخاصة بهذه المادة موجودة عند منصة Uniflix، انتقل لها مباشرة من الرابط:'],
      links: [{ t: 'افتح منصة Uniflix', u: 'https://uniflixjo.com/ar' }]
    },
    {
      id: 'doctors',
      kw: ['ايميل', 'ايميلات', 'ايميلات الدكاترة', 'دكتور', 'دكاترة', 'دكتورة', 'دكاتره', 'مدرس', 'استاذ', 'اساتذة', 'email', 'professor', 'تواصل مع الدكتور', 'بريد الدكتور'],
      text: ['قائمة إيميلات الدكاترة موجودة في قسم مخصص بالمصادر الأكاديمية، تقدر تتواصل معهم مباشرة منها.'],
      links: [{ t: 'إيميلات الدكاترة', u: 'academic-resources.html?open=doctors' }]
    },
    {
      id: 'ai_tools',
      kw: ['ادوات ai', 'أدوات ai', 'ادوات الذكاء', 'ذكاء اصطناعي', 'ذكاء اصطناعى', 'الذكاء الاصطناعي', 'ai tools', 'ai', 'ذكاء', 'اصطناعي'],
      text: ['قسم أدوات AI في المنصة يجمع أدوات الذكاء الاصطناعي المساعدة في الدراسة، ويتم تحديثه باستمرار.'],
      links: [{ t: 'أدوات AI', u: 'academic-resources.html?open=ai_tools' }]
    },
    {
      id: 'presentation', boost: 15,
      kw: ['برزنتيشن', 'بريزنتيشن', 'بروزنتيشن', 'بريزنتيشين', 'presentation', 'powerpoint', 'باوربوينت', 'بوربوينت', 'ppt', 'عرض تقديمي', 'عروض تقديمية', 'عمل سلايدات', 'تصميم سلايدات', 'تصميم عرض', 'gamma', 'canva', 'كانفا', 'جاما', 'سلايدات ai', 'عرض تقديمي بالذكاء'],
      text: [
        'لتجهيز برزنتيشن بسرعة بمساعدة الذكاء الاصطناعي، هذي أشهر الأدوات:',
        '• Gamma: يولّد عرضاً كاملاً من وصف نصي أو ملاحظاتك.',
        '• Canva: قوالب جاهزة وتصميم سهل مع ميزات ذكاء اصطناعي.',
        '• Beautiful.ai: تنسيق تلقائي للشرائح أثناء الكتابة.',
        'وتقدر تشوف أدوات AI التي جمعتها المنصة للطلاب من الرابط الأخير.'
      ],
      links: [
        { t: 'Gamma', u: 'https://gamma.app' },
        { t: 'Canva', u: 'https://www.canva.com' },
        { t: 'Beautiful.ai', u: 'https://www.beautiful.ai' },
        { t: 'أدوات AI في StudeX', u: 'academic-resources.html?open=ai_tools' }
      ]
    },
    {
      id: 'opportunities',
      kw: ['فرص', 'فرصة', 'فرصه', 'منح', 'منحة', 'منحه', 'تدريب', 'تدريب صيفي', 'internship', 'scholarship', 'opportunities', 'تطوع', 'متاحة حاليا'],
      text: ['صفحة الفرص تجمّع تلقائياً المنح والتدريب المتاح حالياً، مع أفضل الكورسات المجانية.'],
      links: [
        { t: 'المنح والتدريب', u: 'opportunities.html?tab=opportunities' },
        { t: 'الفرص والدورات', u: 'opportunities.html' }
      ]
    },
    {
      id: 'courses',
      kw: ['كورس', 'كورسات', 'دورة', 'دورات', 'دوره', 'courses', 'course', 'تعلم', 'مجاني', 'مجانية', 'شهادة', 'شهادات', 'certificate'],
      text: ['ستجد أفضل الكورسات المجانية في قسم الكورسات ضمن صفحة الفرص والدورات.'],
      links: [{ t: 'الكورسات المجانية', u: 'opportunities.html?tab=courses' }]
    },
    {
      id: 'linkedin',
      kw: ['linkedin', 'لينكدان', 'لينكد ان', 'لينكدإن', 'لنكدان', 'بروفايل', 'حساب مهني', 'سيرة ذاتية', 'سيره ذاتيه', 'cv', 'سي في', 'توظيف', 'وظيفة', 'وظيفه', 'تطوير مهني', 'التطوير المهني'],
      text: ['صفحة التطوير المهني فيها دليل شامل لإنشاء حساب LinkedIn احترافي وبناء بروفايل مميز.'],
      links: [
        { t: 'دليل LinkedIn', u: 'career.html?tab=linkedin' },
        { t: 'التطوير المهني', u: 'career.html' }
      ]
    },
    {
      id: 'orgs',
      kw: ['مؤسسات مهنية', 'مؤسسات', 'منظمات', 'نوادي', 'ناديه', 'نادي', 'جمعيات', 'ieee', 'organizations'],
      text: ['للتعرف على المؤسسات المهنية التي ممكن تنضم لها، شوف قسم المؤسسات في صفحة التطوير المهني.'],
      links: [{ t: 'المؤسسات المهنية', u: 'career.html?tab=orgs' }]
    },
    {
      id: 'community',
      kw: ['مجتمع', 'اسال', 'اسأل', 'سؤال', 'اسئلة', 'ساعدني', 'نقاش', 'منشور', 'اطرح', 'community', 'ask', 'استفسار'],
      text: ['في مجتمع StudeX تقدر تطرح سؤالك في قسم "اسأل" ويجاوبك طلاب آخرين، أو تشارك تجربتك وتساعد غيرك.'],
      links: [{ t: 'مجتمع الطلاب', u: 'community.html' }]
    },
    {
      id: 'whatsapp',
      kw: ['واتساب', 'واتس', 'جروب', 'جروبات', 'قروب', 'قروبات', 'مجموعة', 'مجموعات', 'whatsapp', 'group', 'groups', 'دفعة', 'دفعه', 'تخصص'],
      text: ['جروبات الواتساب مصنّفة حسب الدفعة والتخصص وجروبات المواد، وكلها مجمّعة في صفحة المجتمع.'],
      links: [{ t: 'جروبات الواتساب', u: 'community.html' }]
    },
    {
      id: 'about',
      kw: ['من نحن', 'عن المنصة', 'عن studex', 'مين انتو', 'about', 'من انتم', 'من انتو', 'فريق', 'المطور', 'مطور', 'ما هي المنصة', 'شو هي المنصة'],
      text: ['StudeX منصة طلابية رقمية لطلاب الجامعة الأردنية: حاسبة معدل، لوحة تخطيط، مصادر أكاديمية، فرص، ومجتمع طلابي.'],
      links: [{ t: 'من نحن', u: 'about.html' }]
    },
    {
      id: 'contact',
      kw: ['تواصل', 'تواصل معكم', 'تواصل معنا', 'انستغرام', 'انستجرام', 'instagram', 'اقتراح', 'مشكلة', 'مشكله', 'ابلاغ', 'ملاحظة', 'ملاحظه', 'contact'],
      text: ['تقدر تتواصل مع فريق StudeX وتتابع جديد المنصة عبر حسابنا على إنستغرام.'],
      links: [
        { t: 'إنستغرام StudeX', u: 'https://instagram.com/studex.platform' },
        { t: 'من نحن', u: 'about.html' }
      ]
    },
    {
      id: 'darkmode',
      kw: ['دارك', 'dark', 'ليلي', 'الوضع الليلي', 'وضع ليلي', 'dark mode', 'darkmode', 'مظلم', 'الوضع المظلم'],
      text: ['لتفعيل الوضع الليلي أو الرجوع للفاتح، استخدم زر القمر/الشمس في شريط التنقل أعلى الصفحة. اختيارك يُحفظ تلقائياً.'],
      links: []
    },
    {
      id: 'install',
      kw: ['تطبيق', 'تثبيت', 'تنزيل', 'pwa', 'install', 'اضافة للشاشة', 'شاشة رئيسية', 'الشاشة الرئيسية', 'ايقونة'],
      text: ['المنصة تعمل كتطبيق ويب: من قائمة المتصفح اختر "إضافة إلى الشاشة الرئيسية" وراح تفتح مثل أي تطبيق.'],
      links: []
    },
    {
      id: 'help',
      kw: ['مساعدة', 'مساعده', 'help', 'شو بتعمل', 'ماذا تستطيع', 'شو بتقدر', 'ايش تقدر', 'وش تقدر', 'ماذا يمكنك'],
      text: ['أقدر أدلّك على أدوات المنصة ومصادرها. اسألني مثلاً عن:'],
      links: [],
      chips: ['حاسبة المعدل', 'مصادر المواد', 'أدوات AI للبرزنتيشن', 'الفرص والمنح', 'لوحة التخطيط', 'جروبات الواتساب']
    },
    {
      id: 'greeting', soft: true,
      kw: ['مرحبا', 'مرحبا بك', 'اهلا', 'اهلين', 'هلا', 'هلو', 'سلام', 'السلام عليكم', 'صباح الخير', 'مساء الخير', 'hi', 'hello', 'hey'],
      text: ['أهلاً فيك في StudeX! 👋 أنا مساعدك الذكي، اسألني عن المصادر، حاسبة المعدل، أدوات الذكاء الاصطناعي وغيرها.'],
      links: [],
      chips: ['حاسبة المعدل', 'مصادر المواد', 'أدوات AI للبرزنتيشن']
    },
    {
      id: 'thanks', soft: true,
      kw: ['شكرا', 'شكرا لك', 'يعطيك العافية', 'يعطيك العافيه', 'مشكور', 'thanks', 'thank you', 'تسلم', 'ممتاز'],
      text: ['العفو! 😊 إذا احتجت أي شي ثاني أنا موجود.'],
      links: []
    }
  ];

  var QUICK_CHIPS = ['حاسبة المعدل', 'مصادر المواد', 'أدوات AI للبرزنتيشن', 'الفرص والمنح', 'لوحة التخطيط'];

  var OPEN_TITLES = {
    slides: 'مصادر المواد والسلايدات وأسئلة السنوات',
    doctors: 'إيميلات الدكاترة',
    ai_tools: 'أدوات AI'
  };

  var GROUP_TEXT = 'لقيت لك مصادر لهذا الموضوع على أكثر من منصة، افتح الأنسب لك:';

  var FALLBACK_TEXT = 'ما لقيت جواب دقيق لسؤالك 🤔 جرّب تكتبه بكلمات ثانية، أو اختر من المواضيع التالية:';

  /* ============================================================
   *  محرك البحث بالكلمات المفتاحية
   * ============================================================ */
  function norm(s) {
    return String(s || '').toLowerCase()
      .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
      .replace(/[\u060C\u061B\u061F]/g, ' ')
      .replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه')
      .replace(/ؤ/g, 'و').replace(/ئ/g, 'ي')
      .replace(/[^\u0600-\u06FFa-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ').trim();
  }

  function isAscii(s) { return /^[a-z0-9 ]+$/.test(s); }

  function stripAl(t) {
    return t.replace(/^(وال|بال|فال|كال|لل|ال)(?=.{2,})/, '');
  }

  function prepareQuery(q) {
    var n = norm(q);
    var tokens = n ? n.split(' ') : [];
    var stems = tokens.map(stripAl);
    return { n: n, padded: ' ' + n + ' ', tokens: tokens, stems: stems };
  }

  function scoreEntry(entry, Q) {
    var score = 0;
    for (var i = 0; i < entry.kw.length; i++) {
      var k = entry._nk[i];
      if (!k) continue;
      var hit = false;
      if (isAscii(k)) {
        if (k.indexOf(' ') >= 0) {
          hit = Q.padded.indexOf(' ' + k + ' ') >= 0;
        } else {
          hit = Q.tokens.indexOf(k) >= 0 || (k.length >= 5 && Q.tokens.some(function (t) { return t.indexOf(k) === 0; }));
        }
      } else if (k.indexOf(' ') >= 0) {
        hit = Q.n.indexOf(k) >= 0;
      } else if (k.length >= 3) {
        hit = Q.n.indexOf(k) >= 0;
      } else {
        hit = Q.tokens.indexOf(k) >= 0 || Q.stems.indexOf(k) >= 0;
      }
      if (hit) {
        score += (k.length >= 5 ? 3 : 2) + (k.indexOf(' ') >= 0 ? 1 : 0);
      }
    }
    return score;
  }

  KB.forEach(function (e) { e._nk = e.kw.map(norm); });

  function search(query) {
    var Q = prepareQuery(query);
    if (!Q.n) return { best: null, related: [] };
    var all = KB.map(function (e) {
      var s = scoreEntry(e, Q);
      if (s > 0 && e.boost) s += e.boost;
      return { e: e, s: s };
    }).filter(function (x) { return x.s >= 2; })
      .sort(function (a, b) { return b.s - a.s; });
    // الردود الاجتماعية (ترحيب/شكر) لا تُختار إلا إذا لم يطابق أي موضوع حقيقي
    var scored = all.filter(function (x) { return !x.e.soft; });
    if (!scored.length) scored = all;
    if (!scored.length) return { best: null, related: [] };
    var top = scored[0];
    var best = top.e;
    // كلمة مشتركة بين عدة منصات (نفس group): نعرض روابطها كلها في رد واحد
    if (top.e.group) {
      var mates = scored.filter(function (x) { return x.e.group === top.e.group; });
      if (mates.length > 1) {
        best = { id: top.e.id, text: [GROUP_TEXT], links: [] };
        mates.forEach(function (x) { best.links = best.links.concat(x.e.links); });
      }
    }
    var related = scored.slice(1).filter(function (x) {
      return !x.e.soft && !(top.e.group && x.e.group === top.e.group) && x.s >= 3 && x.s >= top.s * 0.6;
    }).slice(0, 2).map(function (x) { return x.e; });
    return { best: best, related: related };
  }

  var CHIP_TO_QUERY = {};
  function chipQuery(label) { return CHIP_TO_QUERY[label] || label; }

  /* ============================================================
   *  دليل الدكاترة — بحث بالاسم أو بالقسم (بيانات محلية)
   *  كل عنصر: [الاسم, الايميل, القسم]
   * ============================================================ */
  var DOCTORS = [
    ['أنس الربضي', 'a.alrabadi@ju.edu.jo', 'هندسة الحاسوب'],
    ['أشرف الصياغ', 'a.suyyagh@ju.edu.jo', 'هندسة الحاسوب'],
    ['فهد جبير', 'f.jubair@ju.edu.jo', 'هندسة الحاسوب'],
    ['غيث عبندة', 'abandah@ju.edu.jo', 'هندسة الحاسوب'],
    ['اياد جعفر', 'iyad.jafar@ju.edu.jo', 'هندسة الحاسوب'],
    ['خالد درابكة', 'k.darabkeh@ju.edu.jo', 'هندسة الحاسوب'],
    ['محمد عبدالمجيد', 'M.Abdel-Majeed@ju.edu.jo', 'هندسة الحاسوب'],
    ['رمزي سعيفان', 'r.saifan@ju.edu.jo', 'هندسة الحاسوب'],
    ['سعادة سويدان', 's.sweadan@ju.edu.jo', 'هندسة الحاسوب'],
    ['سماح رحامنه', 's.rahamneh@ju.edu.jo', 'هندسة الحاسوب'],
    ['طلال العدوان', 't.edwan@ju.edu.jo', 'هندسة الحاسوب'],
    ['وليد دويك', 'w.dweik@ju.edu.jo', 'هندسة الحاسوب'],
    ['أسماء عبد الكريم', 'asma_abdelkarim@hotmail.com', 'هندسة الحاسوب'],
    ['محمود الخصاونة', 'm_khasawneh@ju.edu.jo', 'هندسة الحاسوب'],
    ['ضياء ابو النادي', 'dnadi@ju.edu.jo', 'الهندسة الكهربائية'],
    ['إياد أبو الفيلات', 'e.feilat@ju.edu.jo', 'الهندسة الكهربائية'],
    ['عصام زعبلاوي', 'i.zabalawi@au.edu.ku', 'الهندسة الكهربائية'],
    ['جمال رحال', 'rahhal@ju.edu.jo', 'الهندسة الكهربائية'],
    ['محمد حاج أحمد', 'm.hajahmed@ju.edu.jo', 'الهندسة الكهربائية'],
    ['محمد حوا', 'hawa@ju.edu.jo', 'الهندسة الكهربائية'],
    ['محمد خصاونة', 'm.khasawneh@ju.edu.jo', 'الهندسة الكهربائية'],
    ['نبيل طوالبة', 'ntawalbeh@ju.edu.jo', 'الهندسة الكهربائية'],
    ['عثمان الصمادي', 'othmanmk@ju.edu.jo', 'الهندسة الكهربائية'],
    ['رعد الزعبي', 'r.alzubi@ju.edu.jo', 'الهندسة الكهربائية'],
    ['صادق حامد', 'hamed@ju.edu.jo', 'الهندسة الكهربائية'],
    ['صالح صالح', 'asaleh@unb.ca', 'الهندسة الكهربائية'],
    ['غازي السكر', 'ghazi.alsukkar@ju.edu.jo', 'الهندسة الكهربائية'],
    ['هاني جملة', 'h.jamleh@ju.edu.jo', 'الهندسة الكهربائية'],
    ['حسن فراحنة', 'h.farahneh@ju.edu.jo', 'الهندسة الكهربائية'],
    ['سحبان الناصر', 's.alnaser@ju.edu.jo', 'الهندسة الكهربائية'],
    ['سيرين الظاهر', 's.thaher@ju.edu.jo', 'الهندسة الكهربائية'],
    ['ينال الفاعوري', 'y.faouri@ju.edu.jo', 'الهندسة الكهربائية'],
    ['يزن البدارنه', 'yalbadarneh@ju.edu.jo', 'الهندسة الكهربائية'],
    ['يزيد خطابي', 'y.khattabi@ju.edu.jo', 'الهندسة الكهربائية'],
    ['احمد الجمرة', 'jamrah@ju.edu.jo', 'الهندسة المدنية'],
    ['احمد اشتيات', 'a.ashteyat@ju.edu.jo', 'الهندسة المدنية'],
    ['انيس الشطناوي', 'ashatnawi@ju.edu.jo', 'الهندسة المدنية'],
    ['بشار الطراونة', 'btarawneh@ju.edu.jo', 'الهندسة المدنية'],
    ['غالب صويص', 'gsweis@ju.edu.jo', 'الهندسة المدنية'],
    ['محمود بطاح', 'albattah@ju.edu.jo', 'الهندسة المدنية'],
    ['معتصم عبد الجابر', 'm.abduljaber@ju.edu.jo', 'الهندسة المدنية'],
    ['نسيم الشطرات', 'n.shatarat@ju.edu.jo', 'الهندسة المدنية'],
    ['نزال العرموطي', 'armouti@ju.edu.jo', 'الهندسة المدنية'],
    ['نضال الحدادين', 'N.Hadadin@ju.edu.jo', 'الهندسة المدنية'],
    ['رضوان الوشاح', 'weshah11@yahoo.com', 'الهندسة المدنية'],
    ['ياسر الحنيطي', 'hunaiti@hu.edu.jo', 'الهندسة المدنية'],
    ['بشار الصمادي', 'b.alsmadi@ju.edu.jo', 'الهندسة المدنية'],
    ['هناء نغوي', 'h.naghawi@ju.edu.jo', 'الهندسة المدنية'],
    ['خير الدين بسيسو', 'k.bsisu@ju.edu.jo', 'الهندسة المدنية'],
    ['خلدون شطناوي', 'kshatanawi@ju.edu.jo', 'الهندسة المدنية'],
    ['ليث طاشمان', 'ltashman@hotmail.com', 'الهندسة المدنية'],
    ['مها علقم', 'm.alqam@ju.edu.jo', 'الهندسة المدنية'],
    ['مازن مسمار', 'm.musmar@ju.edu.jo', 'الهندسة المدنية'],
    ['مهند اسميك', 'ismeik@ju.edu.jo', 'الهندسة المدنية'],
    ['رباب اللوزي', 'r.louzi@ju.edu.jo', 'الهندسة المدنية'],
    ['رنا الإمام', 'R.IMAM@JU.EDU.JO', 'الهندسة المدنية'],
    ['شادي مقبل', 's.moqbel@ju.edu.jo', 'الهندسة المدنية'],
    ['ياسمين مراد', 'y.murad@ju.edu.jo', 'الهندسة المدنية'],
    ['عامر الكلوب', 'a.kloub@ju.edu.jo', 'الهندسة المدنية'],
    ['غادة كساب', 'Ghada.kassab@ju.edu.jo', 'الهندسة المدنية'],
    ['حسام ابو حجر', 'H.Abuhajar@ju.edu.jo', 'الهندسة المدنية'],
    ['حسين القروم', 'h.alkroom@ju.edu.jo', 'الهندسة المدنية'],
    ['محمد ناصر', 'm.naser@ju.edu.jo', 'الهندسة المدنية'],
    ['محمد طراونة', 'm.tarawneh@ju.edu.jo', 'الهندسة المدنية'],
    ['محمد حتامله', 'm.hatamleh@ju.edu.jo', 'الهندسة المدنية'],
    ['مجاهد ذنيبات', 'm_thneibat@ju.edu.jo', 'الهندسة المدنية'],
    ['رامية العجارمة', 'r.ajarmeh@ju.edu.jo', 'الهندسة المدنية'],
    ['واصل البدور', 'w.bodour@ju.edu.jo', 'الهندسة المدنية'],
    ['عبد السلام الشبول', 'alshboul@ju.edu.jo', 'هندسة العمارة'],
    ['علي أبو غنيمة', 'ghanimeh@ju.edu.jo', 'هندسة العمارة'],
    ['ديالا الطراونة', 'D.Altarawneh@ju.edu.jo', 'هندسة العمارة'],
    ['فراس شرف', 'f.sharaf@ju.edu.jo', 'هندسة العمارة'],
    ['حسن العيسوي', 'H.isawi@ju.edu.jo', 'هندسة العمارة'],
    ['جودت القسوس', 'j_goussous@ju.edu.jo', 'هندسة العمارة'],
    ['خالد العمري', 'K.Omari@ju.edu.jo', 'هندسة العمارة'],
    ['نبيل الكردي', 'nabeelprimo@hotmail.com', 'هندسة العمارة'],
    ['نانسي العساف', 'N_assaf@ju.edu.jo', 'هندسة العمارة'],
    ['سليم الدحابرة', 'saleem.dahabreh@ju.edu.jo', 'هندسة العمارة'],
    ['سامر أبو غزالة', 's.abughazalah@ju.edu.jo', 'هندسة العمارة'],
    ['وائل الأزهري', 'w.alazhari@ju.edu.jo', 'هندسة العمارة'],
    ['أحلام الحراحشة', 'a.harahsheh@ju.edu.jo', 'هندسة العمارة'],
    ['آيات الخريسات', 'A.Khreasat@ju.edu.jo', 'هندسة العمارة'],
    ['فادية النصار', 'f.alnassar@ju.edu.jo', 'هندسة العمارة'],
    ['حنين السوالقة', 'h.alsawalqah@ju.edu.jo', 'هندسة العمارة'],
    ['هبة الله استيتية', 'h.stetieh@ju.edu.jo', 'هندسة العمارة'],
    ['خلود حسونة', 'k.hassouneh@ju.edu.jo', 'هندسة العمارة'],
    ['احمد القيسية', 'alqaisia@ju.edu.jo', 'الهندسة الميكانيكية'],
    ['أحمد السلايمة', 'salaymeh@ju.edu.jo', 'الهندسة الميكانيكية'],
    ['أيمن المعايطة', 'a.almaaitah@ju.edu.jo', 'الهندسة الميكانيكية'],
    ['باسم البدور', 'albedoor@ju.edu.jo', 'الهندسة الميكانيكية'],
    ['حمزه الدويري', 'duwairi@ju.edu.jo', 'الهندسة الميكانيكية'],
    ['إبراهيم أبو الشيخ', 'i.abualshaikh@ju.edu.jo', 'الهندسة الميكانيكية'],
    ['جميل الاصفر', 'jasfar@ju.edu.jo', 'الهندسة الميكانيكية'],
    ['محمود ارشيدات', 'M.Irshidat@ju.edu.jo', 'الهندسة الميكانيكية'],
    ['ناصر الحنيطي', 'alhuniti@ju.edu.jo', 'الهندسة الميكانيكية'],
    ['اسامة ابو زيد', 'oabuzeid@ju.edu.jo', 'الهندسة الميكانيكية'],
    ['صالح العكور', 'akour@ju.edu.jo', 'الهندسة الميكانيكية'],
    ['يوسف حايك', 'yhaik@sharjah.ac.ae', 'الهندسة الميكانيكية'],
    ['علي الحديدي', 'ahadidi@ju.edu.jo', 'الهندسة الميكانيكية'],
    ['بشار قواسمه', 'b.qawasmeh@ju.edu.jo', 'الهندسة الميكانيكية'],
    ['هاشم الخالدي', 'h.alkhaldi@ju.edu.jo', 'الهندسة الميكانيكية'],
    ['جهاد يامين', 'yamin@ju.edu.jo', 'الهندسة الميكانيكية'],
    ['منار الحجي', 'M.Hajji@ju.edu.jo', 'الهندسة الميكانيكية'],
    ['محمد الرباعي', 'm.alrbai@ju.edu.jo', 'الهندسة الميكانيكية'],
    ['مضر الزغول', 'm.zgoul@ju.edu.jo', 'الهندسة الميكانيكية'],
    ['موسى عبدالله', 'musa.abdalla@ju.edu.jo', 'الهندسة الميكانيكية'],
    ['أسيد مطر', 'o.matar@ju.edu.jo', 'الهندسة الميكانيكية'],
    ['أسامة عيادي', 'o.ayadi@ju.edu.jo', 'الهندسة الميكانيكية'],
    ['سلام المجالي', 's.almajali@ju.edu.jo', 'الهندسة الميكانيكية'],
    ['علي المطر', 'aalmatar@ju.edu.jo', 'الهندسة الكيميائية'],
    ['حاتم السيوري', 'alsyouri@ju.edu.jo', 'الهندسة الكيميائية'],
    ['إقبال مجتبى', 'i.mujtaba@ju.edu.jo', 'الهندسة الكيميائية'],
    ['كريست جيرناي', 'k.gernaey@ju.edu.jo', 'الهندسة الكيميائية'],
    ['منور التراكية العبادي', 'm.attarakih@ju.edu.jo', 'الهندسة الكيميائية'],
    ['محمد الشناق', 'm.shannag@ju.edu.jo', 'الهندسة الكيميائية'],
    ['محمد قطيشات', 'm.qtaishat@ju.edu.jo', 'الهندسة الكيميائية'],
    ['معتصم سعيدان', 'm.saidan@ju.edu.jo', 'الهندسة الكيميائية'],
    ['رياض الشوابكة', 'rshawabk@ju.edu.jo', 'الهندسة الكيميائية'],
    ['يحيى الخريشه', 'khraisha@ju.edu.jo', 'الهندسة الكيميائية'],
    ['يوسف مبارك', 'ymubarak@ju.edu.jo', 'الهندسة الكيميائية'],
    ['زايد الحمامرة', 'z.hamamre@ju.edu.jo', 'الهندسة الكيميائية'],
    ['عبدالله نصر', 'a_nasr@ju.edu.jo', 'الهندسة الكيميائية'],
    ['ليندا الحمود', 'l.alhmoud@ju.edu.jo', 'الهندسة الكيميائية'],
    ['عباس الرفاعي', 'abbas.alrefai@ju.edu.jo', 'الهندسة الصناعية'],
    ['عبد الكريم عبد الجواد', 'akjawwad@ju.edu.jo', 'الهندسة الصناعية'],
    ['علي ذيابات', 'Diabat@nyu.edu', 'الهندسة الصناعية'],
    ['بلال الغرايبة', 'b.gharaibeh@ju.edu.jo', 'الهندسة الصناعية'],
    ['غالب عباسي', 'abbasi@ju.edu.jo', 'الهندسة الصناعية'],
    ['ابراهيم الروابدة', 'rawabdeh@ju.edu.jo', 'الهندسة الصناعية'],
    ['عصام جلهم', 'Jalham@ju.edu.jo', 'الهندسة الصناعية'],
    ['محمود برغش', 'mabargha@ju.edu.jo', 'الهندسة الصناعية'],
    ['مازن عرفة', 'Mazen.arafeh@ju.edu.jo', 'الهندسة الصناعية'],
    ['محمد الطاهات', 'altahat@ju.edu.jo', 'الهندسة الصناعية'],
    ['سائد مسمار', 's.musmar@ju.edu.jo', 'الهندسة الصناعية'],
    ['يوسف العبداللات', 'abdallat@ju.edu.jo', 'الهندسة الصناعية'],
    ['عواد دبابنة', 'dababneh@ju.edu.jo', 'الهندسة الصناعية'],
    ['لميس الضرغام', 'l.aldurgham@ju.edu.jo', 'الهندسة الصناعية'],
    ['لينة القطاونة', 'lqatawneh@ju.edu.jo', 'الهندسة الصناعية'],
    ['محمد الشبول', 'm.shbool@ju.edu.jo', 'الهندسة الصناعية'],
    ['مهند جريسات', 'm.jreissat@ju.edu.jo', 'الهندسة الصناعية'],
    ['نبال البشابشة', 'n.Albashabsheh@ju.edu.jo', 'الهندسة الصناعية'],
    ['روان الطراونة', 'engrawantto6@hotmail.com', 'الهندسة الصناعية'],
    ['شهد عبيدات', 'Sh.obeidat@ju.edu.jo', 'الهندسة الصناعية'],
    ['وفاء العلاوين', 'w.alaween@ju.edu.jo', 'الهندسة الصناعية'],
    ['وليد خريسات', 'w.khraisat@ju.edu.jo', 'الهندسة الصناعية'],
    ['يزن الزين', 'y.alzain@ju.edu.jo', 'الهندسة الصناعية'],
    ['أدهم الشرقاوي', 'a.sharkawi@ju.edu.jo', 'هندسة الميكاترونيكس'],
    ['احمد ملكاوي', 'ah.malkawi@ju.edu.jo', 'هندسة الميكاترونيكس'],
    ['حسام الخصاونة', 'h.khasawneh@ju.edu.jo', 'هندسة الميكاترونيكس'],
    ['محمد الجنايدة', 'aljanaideh@gmail.com', 'هندسة الميكاترونيكس'],
    ['محمد مشاقبة', 'm.mashagbeh@ju.edu.jo', 'هندسة الميكاترونيكس'],
    ['محمد الكيلاني', 'mkilani@ju.edu.jo', 'هندسة الميكاترونيكس'],
    ['محمد مساعده', 'm.masadeh@ju.edu.jo', 'هندسة الميكاترونيكس'],
    ['موسى اليمن', 'm.alyaman@ju.edu.jo', 'هندسة الميكاترونيكس'],
    ['أسامة الهباهبة', 'o.habahbeh@ju.edu.jo', 'هندسة الميكاترونيكس'],
    ['رياض الكساسبة', 'r.al-kasasbeh@ju.edu.jo', 'هندسة الميكاترونيكس'],
    ['سامر صلاح', 'samer.salah@ju.edu.jo', 'هندسة الميكاترونيكس'],
    ['زائر أبو حمور', 'zaer@ju.edu.jo', 'هندسة الميكاترونيكس']
  ];

  var DOC_DEPTS = [
    { name: 'هندسة الحاسوب', kw: ['هندسة الحاسوب', 'هندسة الكمبيوتر', 'حاسوب', 'computer engineering'] },
    { name: 'الهندسة الكهربائية', kw: ['الهندسة الكهربائية', 'هندسة كهربائية', 'كهربائية', 'كهرباء', 'electrical'] },
    { name: 'الهندسة المدنية', kw: ['الهندسة المدنية', 'هندسة مدنية', 'مدنية', 'civil'] },
    { name: 'هندسة العمارة', kw: ['هندسة العمارة', 'هندسة معمارية', 'العمارة', 'عمارة', 'معمارية', 'architecture'] },
    { name: 'الهندسة الميكانيكية', kw: ['الهندسة الميكانيكية', 'هندسة ميكانيكية', 'ميكانيكية', 'ميكانيك', 'mechanical'] },
    { name: 'الهندسة الكيميائية', kw: ['الهندسة الكيميائية', 'هندسة كيميائية', 'كيميائية', 'chemical engineering'] },
    { name: 'الهندسة الصناعية', kw: ['الهندسة الصناعية', 'هندسة صناعية', 'صناعية', 'industrial'] },
    { name: 'هندسة الميكاترونيكس', kw: ['هندسة الميكاترونيكس', 'ميكاترونيكس', 'ميكاترونكس', 'mechatronics'] }
  ];

  var DOC_INTENT = ['ايميل', 'ايميلات', 'ايميله', 'بريد', 'email', 'emails', 'mail', 'دكتور', 'دكتوره', 'دكاتره', 'دكترة', 'اساتذه', 'استاذ', 'doctor', 'doctors', 'قسم', 'اقسام'];
  var DOC_STOP = DOC_INTENT.concat(['د', 'بدي', 'اريد', 'ابغي', 'ابي', 'شو', 'ايش', 'وش', 'ما', 'هو', 'هي', 'تبع', 'عند', 'يا', 'لو', 'ممكن', 'اعطني', 'اعطيني', 'عطني', 'هات', 'طلب', 'عن', 'في', 'من', 'لل', 'ل', 'عبد', 'ابو', 'ابن', 'بن']);
  var DOC_WEAK = ['عبد', 'ابو', 'ابن', 'بن'];

  DOC_STOP = DOC_STOP.map(function (w) { return stripAl(norm(w)); });
  DOC_INTENT = DOC_INTENT.map(function (w) { return stripAl(norm(w)); });
  DOC_DEPTS.forEach(function (d) { d._k = d.kw.map(norm); });
  DOCTORS.forEach(function (d) {
    d._t = norm(d[0]).split(' ').map(stripAl).filter(function (t) { return t.length >= 2 && DOC_WEAK.indexOf(t) < 0; });
  });

  function docResult(list, text, chips) {
    return { text: [text], docs: list, chips: chips || [] };
  }

  /* يرجع null إذا السؤال مش عن دكتور/قسم، فيكمل البحث العادي */
  function doctorAnswer(query) {
    var Q = prepareQuery(query);
    if (!Q.n) return null;
    var hasIntent = Q.stems.some(function (t) { return DOC_INTENT.indexOf(t) >= 0; });
    var qt = Q.stems.filter(function (t) { return t.length >= 2 && DOC_STOP.indexOf(t) < 0; });

    var hits = DOCTORS.map(function (d) {
      var n = 0;
      d._t.forEach(function (t) { if (qt.indexOf(t) >= 0) n++; });
      return { d: d, n: n };
    });
    var max = 0;
    hits.forEach(function (h) { if (h.n > max) max = h.n; });

    // 1) اسم الدكتور (كلمتان أو أكثر مطابقة)
    if (max >= 2) {
      var exact = hits.filter(function (h) { return h.n === max; }).map(function (h) { return h.d; });
      return docResult(exact, exact.length === 1 ? 'هذي بيانات الدكتور:' : 'لقيت ' + exact.length + ' دكاترة بهذا الاسم:');
    }

    // 2) قسم كامل (يحتاج كلمة طلب مثل ايميل/دكاترة/قسم)
    if (hasIntent) {
      var depts = DOC_DEPTS.filter(function (d) { return d._k.some(function (k) { return Q.n.indexOf(k) >= 0; }); });
      if (depts.length) {
        var names = depts.map(function (d) { return d.name; });
        var list = DOCTORS.filter(function (d) { return names.indexOf(d[2]) >= 0; });
        return docResult(list, 'لقيت ' + list.length + ' دكتور في ' + (names.length === 1 ? 'قسم ' + names[0] : 'الأقسام المطلوبة') + ':');
      }
    }

    // 3) اسم أول/أخير واحد فقط
    if (max === 1 && qt.length === 1 && qt[0].length >= 3 && (hasIntent || search(qt[0]).best === null)) {
      var some = hits.filter(function (h) { return h.n >= 1; }).map(function (h) { return h.d; });
      if (some.length <= 6) {
        return docResult(some, some.length === 1 ? 'هذي بيانات الدكتور:' : 'لقيت ' + some.length + ' دكاترة بهذا الاسم:');
      }
      return docResult([], 'لقيت ' + some.length + ' دكتور بهذا الاسم، اختر الدكتور اللي تقصده أو اكتب اسمه كامل:',
        some.slice(0, 20).map(function (d) { return d[0]; }));
    }
    return null;
  }

  /* خارج المتصفح (اختبار فقط) */
  if (typeof document === 'undefined') {
    if (typeof module !== 'undefined') module.exports = { search: search, KB: KB, norm: norm, doctorAnswer: doctorAnswer, DOCTORS: DOCTORS };
    return;
  }
  window.__studexChatbotLoaded = true;

  /* ============================================================
   *  CSS — متوافق مع ألوان المنصة والوضع الليلي (html.dark)
   * ============================================================ */
  var CSS = [
    '.sxbot-fab,.sxbot-panel,.sxbot-hint{font-family:"Tajawal","Cairo",sans-serif;box-sizing:border-box;}',
    '.sxbot-panel *,.sxbot-fab *{box-sizing:border-box;}',

    /* الزر العائم */
    '.sxbot-fab{position:fixed;left:20px;bottom:20px;bottom:calc(20px + env(safe-area-inset-bottom,0px));z-index:45;width:58px;height:58px;border-radius:50%;',
    'border:1px solid #1E293B;background:#0F172A;color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0;',
    'box-shadow:0 10px 25px -8px rgba(15,23,42,.45);transition:transform .25s cubic-bezier(.2,.8,.2,1),box-shadow .25s ease,background-color .2s;}',
    '.sxbot-fab:hover{transform:translateY(-3px);box-shadow:0 14px 28px -8px rgba(15,23,42,.55);}',
    '.sxbot-fab:focus-visible{outline:3px solid #60A5FA;outline-offset:3px;}',
    '.sxbot-fab svg{width:26px;height:26px;transition:transform .25s ease,opacity .2s ease;position:absolute;}',
    '.sxbot-fab .sxbot-ico-close{opacity:0;transform:rotate(-90deg) scale(.6);}',
    '.sxbot-fab.sxbot-on .sxbot-ico-chat{opacity:0;transform:rotate(90deg) scale(.6);}',
    '.sxbot-fab.sxbot-on .sxbot-ico-close{opacity:1;transform:none;}',
    '.sxbot-dot{position:absolute;top:2px;right:2px;width:12px;height:12px;border-radius:50%;background:#3B82F6;border:2px solid #fff;}',
    '.sxbot-fab.sxbot-on .sxbot-dot,.sxbot-fab.sxbot-seen .sxbot-dot{display:none;}',

    /* فقاعة التلميح */
    '.sxbot-hint{position:fixed;left:88px;bottom:32px;bottom:calc(32px + env(safe-area-inset-bottom,0px));z-index:45;background:#fff;color:#0F172A;border:1px solid #E2E8F0;',
    'border-radius:14px;padding:8px 14px;font-size:13px;font-weight:600;box-shadow:0 10px 25px -10px rgba(15,23,42,.25);opacity:0;transform:translateX(-6px);',
    'pointer-events:none;transition:opacity .3s ease,transform .3s ease;white-space:nowrap;}',
    '.sxbot-hint.sxbot-show{opacity:1;transform:none;}',

    /* النافذة */
    '.sxbot-panel{position:fixed;left:20px;bottom:90px;bottom:calc(90px + env(safe-area-inset-bottom,0px));z-index:45;width:370px;max-width:calc(100vw - 24px);',
    'height:560px;max-height:calc(100vh - 120px);max-height:calc(100dvh - 120px);display:none;flex-direction:column;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:20px;overflow:hidden;',
    'box-shadow:0 24px 50px -16px rgba(15,23,42,.35);color:#0F172A;}',
    '.sxbot-panel.sxbot-open{display:flex;animation:sxbot-pop .28s cubic-bezier(.2,.8,.2,1);transform-origin:bottom left;}',
    '@keyframes sxbot-pop{from{opacity:0;transform:translateY(12px) scale(.96);}to{opacity:1;transform:none;}}',

    '.sxbot-head{display:flex;align-items:center;gap:10px;padding:14px 16px;background:#0F172A;color:#fff;flex-shrink:0;}',
    '.sxbot-avatar{width:38px;height:38px;border-radius:12px;background:rgba(59,130,246,.18);border:1px solid rgba(96,165,250,.35);display:flex;align-items:center;justify-content:center;flex-shrink:0;}',
    '.sxbot-avatar svg{width:20px;height:20px;}',
    '.sxbot-titles{flex:1;min-width:0;}',
    '.sxbot-title{font-family:"Cairo",sans-serif;font-weight:700;font-size:15px;line-height:1.3;margin:0;}',
    '.sxbot-sub{font-size:12px;color:#94A3B8;margin:0;display:flex;align-items:center;gap:6px;}',
    '.sxbot-sub::before{content:"";width:7px;height:7px;border-radius:50%;background:#34D399;display:inline-block;}',
    '.sxbot-hbtn{width:32px;height:32px;border-radius:10px;border:0;background:rgba(255,255,255,.08);color:#CBD5E1;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0;transition:background-color .2s,color .2s;}',
    '.sxbot-hbtn:hover{background:rgba(255,255,255,.16);color:#fff;}',
    '.sxbot-hbtn:focus-visible{outline:2px solid #60A5FA;outline-offset:2px;}',
    '.sxbot-hbtn svg{width:16px;height:16px;}',

    '.sxbot-msgs{flex:1;overflow-y:auto;padding:16px 14px;display:flex;flex-direction:column;gap:12px;scrollbar-width:thin;scrollbar-color:#CBD5E1 transparent;overscroll-behavior:contain;}',
    '.sxbot-row{display:flex;flex-direction:column;gap:8px;max-width:88%;animation:sxbot-in .25s ease;}',
    '@keyframes sxbot-in{from{opacity:0;transform:translateY(6px);}to{opacity:1;transform:none;}}',
    '.sxbot-row.sxbot-bot{align-self:flex-start;}',
    '.sxbot-row.sxbot-user{align-self:flex-end;}',
    '.sxbot-bubble{padding:10px 14px;border-radius:16px;font-size:14px;line-height:1.75;word-wrap:break-word;overflow-wrap:anywhere;}',
    '.sxbot-bot .sxbot-bubble{background:#fff;border:1px solid #E2E8F0;color:#1E293B;border-top-right-radius:6px;}',
    '.sxbot-user .sxbot-bubble{background:#3B82F6;color:#fff;border-top-left-radius:6px;}',
    '.sxbot-bubble p{margin:0;}',
    '.sxbot-bubble p+p{margin-top:6px;}',

    '.sxbot-links{display:flex;flex-direction:column;gap:6px;}',
    '.sxbot-link{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:9px 12px;border-radius:12px;border:1px solid #BFDBFE;background:#EFF6FF;color:#1D4ED8;',
    'font-size:13px;font-weight:700;text-decoration:none;transition:background-color .2s,border-color .2s,transform .2s;}',
    '.sxbot-link:hover{background:#DBEAFE;border-color:#93C5FD;transform:translateY(-1px);}',
    '.sxbot-link:focus-visible{outline:2px solid #3B82F6;outline-offset:2px;}',
    '.sxbot-link svg{width:13px;height:13px;flex-shrink:0;}',

    '.sxbot-chips{display:flex;flex-wrap:wrap;gap:6px;}',
    '.sxbot-chip{border:1px solid #CBD5E1;background:#fff;color:#334155;border-radius:999px;padding:6px 12px;font-size:12.5px;font-weight:600;cursor:pointer;font-family:inherit;transition:border-color .2s,color .2s,background-color .2s;}',
    '.sxbot-chip:hover{border-color:#3B82F6;color:#2563EB;background:#EFF6FF;}',
    '.sxbot-chip:focus-visible{outline:2px solid #3B82F6;outline-offset:2px;}',
    '.sxbot-quick{padding:0 14px 10px;flex-shrink:0;}',
    '.sxbot-quick .sxbot-chips{flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none;padding-bottom:2px;}',
    '.sxbot-quick .sxbot-chips::-webkit-scrollbar{display:none;}',
    '.sxbot-quick .sxbot-chip{white-space:nowrap;flex-shrink:0;}',

    /* بطاقات الدكاترة */
    '.sxbot-docs{display:flex;flex-direction:column;gap:6px;}',
    '.sxbot-doc{padding:9px 12px;border-radius:12px;border:1px solid #E2E8F0;background:#fff;display:flex;flex-direction:column;gap:2px;}',
    '.sxbot-doc-name{font-size:13.5px;font-weight:700;color:#0F172A;}',
    '.sxbot-doc-dept{font-size:12px;color:#64748B;}',
    '.sxbot-doc-mail{font-size:12.5px;font-weight:600;color:#2563EB;text-decoration:none;direction:ltr;text-align:left;unicode-bidi:plaintext;word-break:break-all;}',
    '.sxbot-doc-mail:hover{text-decoration:underline;}',

    '.sxbot-typing{display:inline-flex;gap:4px;align-items:center;padding:12px 14px;}',
    '.sxbot-typing i{width:6px;height:6px;border-radius:50%;background:#94A3B8;animation:sxbot-bounce 1s infinite ease-in-out;}',
    '.sxbot-typing i:nth-child(2){animation-delay:.15s;}.sxbot-typing i:nth-child(3){animation-delay:.3s;}',
    '@keyframes sxbot-bounce{0%,60%,100%{transform:translateY(0);opacity:.5;}30%{transform:translateY(-4px);opacity:1;}}',

    '.sxbot-form{display:flex;gap:8px;padding:12px 14px;background:#fff;border-top:1px solid #E2E8F0;flex-shrink:0;}',
    '.sxbot-input{flex:1;min-width:0;border:1px solid #CBD5E1;background:#F8FAFC;color:#0F172A;border-radius:12px;padding:10px 12px;font-size:16px;font-family:inherit;outline:none;transition:border-color .2s,box-shadow .2s;}',
    '.sxbot-input::placeholder{color:#94A3B8;}',
    '.sxbot-input:focus{border-color:#3B82F6;box-shadow:0 0 0 3px rgba(59,130,246,.18);}',
    '.sxbot-send{width:44px;height:44px;border-radius:12px;border:0;background:#0F172A;color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0;flex-shrink:0;transition:background-color .2s,transform .2s;}',
    '.sxbot-send:hover{background:#2563EB;}',
    '.sxbot-send:focus-visible{outline:2px solid #3B82F6;outline-offset:2px;}',
    '.sxbot-send svg{width:18px;height:18px;transform:scaleX(-1);}',
    '.sxbot-note{font-size:11px;color:#94A3B8;text-align:center;padding:0 14px 10px;background:#fff;margin:0;flex-shrink:0;}',

    /* الجوال */
    '@media (max-width:480px){',
    '.sxbot-panel{left:12px;right:12px;width:auto;max-width:none;bottom:84px;bottom:calc(84px + env(safe-area-inset-bottom,0px));}',
    '.sxbot-fab{left:14px;bottom:14px;bottom:calc(14px + env(safe-area-inset-bottom,0px));}',
    '.sxbot-hint{left:80px;bottom:26px;bottom:calc(26px + env(safe-area-inset-bottom,0px));}',
    '}',
    '@media (prefers-reduced-motion:reduce){.sxbot-panel.sxbot-open,.sxbot-row,.sxbot-typing i{animation:none !important;}.sxbot-fab,.sxbot-link{transition:none;}}',

    /* ===== الوضع الليلي (يتبع كلاس dark على <html>) ===== */
    'html.dark .sxbot-fab{background:#3B82F6;border-color:#60A5FA;box-shadow:0 10px 25px -8px rgba(0,0,0,.6);}',
    'html.dark .sxbot-fab:hover{background:#2563EB;}',
    'html.dark .sxbot-dot{background:#FBBF24;border-color:#0B1120;}',
    'html.dark .sxbot-hint{background:#162033;color:#E5EBF3;border-color:#334155;}',
    'html.dark .sxbot-panel{background:#0B1120;border-color:#334155;color:#E5EBF3;box-shadow:0 24px 50px -16px rgba(0,0,0,.7);}',
    'html.dark .sxbot-head{background:#111A2E;border-bottom:1px solid #334155;}',
    'html.dark .sxbot-msgs{scrollbar-color:#334155 transparent;}',
    'html.dark .sxbot-bot .sxbot-bubble{background:#162033;border-color:#334155;color:#E5EBF3;}',
    'html.dark .sxbot-user .sxbot-bubble{background:#2563EB;color:#fff;}',
    'html.dark .sxbot-link{background:rgba(59,130,246,.12);border-color:rgba(96,165,250,.35);color:#93C5FD;}',
    'html.dark .sxbot-link:hover{background:rgba(59,130,246,.22);border-color:#60A5FA;}',
    'html.dark .sxbot-chip{background:#162033;border-color:#334155;color:#CBD5E1;}',
    'html.dark .sxbot-chip:hover{background:#1E293B;border-color:#60A5FA;color:#93C5FD;}',
    'html.dark .sxbot-typing i{background:#64748B;}',
    'html.dark .sxbot-form,html.dark .sxbot-note{background:#111A2E;}',
    'html.dark .sxbot-form{border-top-color:#334155;}',
    'html.dark .sxbot-input{background:#162033;border-color:#334155;color:#E5EBF3;}',
    'html.dark .sxbot-input::placeholder{color:#64748B;}',
    'html.dark .sxbot-input:focus{border-color:#60A5FA;box-shadow:0 0 0 3px rgba(96,165,250,.2);}',
    'html.dark .sxbot-send{background:#3B82F6;}',
    'html.dark .sxbot-send:hover{background:#2563EB;}',
    'html.dark .sxbot-note{color:#64748B;}',
    'html.dark .sxbot-doc{background:#162033;border-color:#334155;}',
    'html.dark .sxbot-doc-name{color:#E5EBF3;}',
    'html.dark .sxbot-doc-dept{color:#94A3B8;}',
    'html.dark .sxbot-doc-mail{color:#93C5FD;}'
  ].join('');

  /* ============================================================
   *  الأيقونات (SVG)
   * ============================================================ */
  var ICON = {
    chat: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 5.5C5 4.67 5.67 4 6.5 4H17.5C18.33 4 19 4.67 19 5.5V14.5C19 15.33 18.33 16 17.5 16H10L6.4 19.2C5.96 19.6 5.25 19.28 5.25 18.7V16H6.5C5.67 16 5 15.33 5 14.5V5.5Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><circle cx="9.5" cy="10" r="1" fill="currentColor"/><circle cx="12" cy="10" r="1" fill="currentColor"/><circle cx="14.5" cy="10" r="1" fill="currentColor"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 6L18 18M6 18L18 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    bot: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="5" y="8" width="14" height="11" rx="3" stroke="#60A5FA" stroke-width="1.6"/><path d="M12 8V5M12 5H12.01" stroke="#60A5FA" stroke-width="1.8" stroke-linecap="round"/><circle cx="9.5" cy="13" r="1.1" fill="#60A5FA"/><circle cx="14.5" cy="13" r="1.1" fill="#60A5FA"/></svg>',
    send: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 12L20 4L14 20L11 13L4 12Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
    reset: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 12A8 8 0 1 0 7 5.8M4 4V8H8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7 17L17 7M17 7H9M17 7V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  };

  /* ============================================================
   *  بناء الواجهة
   * ============================================================ */
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  var fab, panel, msgs, input, hint, quickWrap, isOpen = false, busy = false, greeted = false;

  function currentFile() {
    var p = location.pathname.split('/').pop();
    return p || 'index.html';
  }

  function injectStyles() {
    var s = document.createElement('style');
    s.id = 'studex-chatbot-css';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  function build() {
    fab = el('button', 'sxbot-fab');
    fab.type = 'button';
    fab.setAttribute('aria-label', 'فتح المساعد الذكي');
    fab.setAttribute('aria-expanded', 'false');
    fab.setAttribute('aria-controls', 'sxbot-panel');
    // الأيقونتان كعناصر svg مباشرة لتطبيق الانتقالات
    fab.innerHTML = ICON.chat.replace('<svg ', '<svg class="sxbot-ico-chat" ') +
      ICON.close.replace('<svg ', '<svg class="sxbot-ico-close" ') +
      '<span class="sxbot-dot"></span>';

    hint = el('span', 'sxbot-hint', 'اسألني عن أي شي بالمنصة 👋');
    hint.setAttribute('aria-hidden', 'true');

    panel = el('section', 'sxbot-panel');
    panel.id = 'sxbot-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'المساعد الذكي StudeX');
    panel.setAttribute('dir', 'rtl');

    // الرأس
    var head = el('div', 'sxbot-head');
    var av = el('div', 'sxbot-avatar'); av.innerHTML = ICON.bot;
    var titles = el('div', 'sxbot-titles');
    titles.appendChild(el('p', 'sxbot-title', 'مساعد StudeX'));
    titles.appendChild(el('p', 'sxbot-sub', 'اسألني عن المصادر والأدوات'));
    var resetBtn = el('button', 'sxbot-hbtn'); resetBtn.type = 'button';
    resetBtn.setAttribute('aria-label', 'محادثة جديدة'); resetBtn.title = 'محادثة جديدة'; resetBtn.innerHTML = ICON.reset;
    var closeBtn = el('button', 'sxbot-hbtn'); closeBtn.type = 'button';
    closeBtn.setAttribute('aria-label', 'إغلاق'); closeBtn.title = 'إغلاق'; closeBtn.innerHTML = ICON.close;
    head.appendChild(av); head.appendChild(titles); head.appendChild(resetBtn); head.appendChild(closeBtn);

    msgs = el('div', 'sxbot-msgs');
    msgs.setAttribute('role', 'log');
    msgs.setAttribute('aria-live', 'polite');

    quickWrap = el('div', 'sxbot-quick');
    var qc = el('div', 'sxbot-chips');
    QUICK_CHIPS.forEach(function (label) { qc.appendChild(makeChip(label)); });
    quickWrap.appendChild(qc);

    var form = el('form', 'sxbot-form');
    form.setAttribute('autocomplete', 'off');
    input = el('input', 'sxbot-input');
    input.type = 'text';
    input.placeholder = 'اكتب سؤالك هنا...';
    input.setAttribute('aria-label', 'اكتب سؤالك');
    input.maxLength = 200;
    var send = el('button', 'sxbot-send'); send.type = 'submit';
    send.setAttribute('aria-label', 'إرسال'); send.innerHTML = ICON.send;
    form.appendChild(input); form.appendChild(send);

    var note = el('p', 'sxbot-note', 'يجيب من معلومات المنصة المحلية — قد لا يغطي كل الأسئلة');

    panel.appendChild(head); panel.appendChild(msgs); panel.appendChild(quickWrap); panel.appendChild(form); panel.appendChild(note);

    document.body.appendChild(panel);
    document.body.appendChild(hint);
    document.body.appendChild(fab);

    fab.addEventListener('click', toggle);
    closeBtn.addEventListener('click', function () { setOpen(false); fab.focus(); });
    resetBtn.addEventListener('click', resetChat);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = input.value.trim();
      if (!v) return;
      input.value = '';
      ask(v);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen) { setOpen(false); fab.focus(); }
    });
  }

  function makeChip(label) {
    var b = el('button', 'sxbot-chip', label);
    b.type = 'button';
    b.addEventListener('click', function () { ask(chipQuery(label), label); });
    return b;
  }

  function scrollDown() { msgs.scrollTop = msgs.scrollHeight; }

  function addUser(text) {
    var row = el('div', 'sxbot-row sxbot-user');
    row.appendChild(el('div', 'sxbot-bubble', text));
    msgs.appendChild(row); scrollDown();
  }

  function linkNode(l) {
    var a = el('a', 'sxbot-link');
    a.href = l.u;
    var span = el('span', null, l.t);
    a.appendChild(span);
    a.insertAdjacentHTML('beforeend', ICON.arrow);
    var external = /^https?:/i.test(l.u);
    if (external) { a.target = '_blank'; a.rel = 'noopener noreferrer'; }
    else { a.addEventListener('click', function (e) { handleInternalLink(e, l.u); }); }
    return a;
  }

  function addBot(entry, opts) {
    opts = opts || {};
    var row = el('div', 'sxbot-row sxbot-bot');
    var bubble = el('div', 'sxbot-bubble');
    (opts.text || (entry && entry.text) || []).forEach(function (line) { bubble.appendChild(el('p', null, line)); });
    row.appendChild(bubble);

    var links = (entry && entry.links) || [];
    if (links.length) {
      var lw = el('div', 'sxbot-links');
      links.forEach(function (l) { lw.appendChild(linkNode(l)); });
      row.appendChild(lw);
    }
    var chips = opts.chips || (entry && entry.chips);
    if (chips && chips.length) {
      var cw = el('div', 'sxbot-chips');
      chips.forEach(function (c) { cw.appendChild(makeChip(c)); });
      row.appendChild(cw);
    }
    msgs.appendChild(row); scrollDown();
  }

  function addDoctors(d) {
    var row = el('div', 'sxbot-row sxbot-bot');
    var bubble = el('div', 'sxbot-bubble');
    d.text.forEach(function (line) { bubble.appendChild(el('p', null, line)); });
    row.appendChild(bubble);
    if (d.docs.length) {
      var list = el('div', 'sxbot-docs');
      d.docs.forEach(function (x) {
        var card = el('div', 'sxbot-doc');
        card.appendChild(el('div', 'sxbot-doc-name', x[0]));
        card.appendChild(el('div', 'sxbot-doc-dept', x[2]));
        var a = el('a', 'sxbot-doc-mail', x[1]);
        a.href = 'mailto:' + x[1];
        a.setAttribute('dir', 'ltr');
        card.appendChild(a);
        list.appendChild(card);
      });
      row.appendChild(list);
    }
    if (d.chips && d.chips.length) {
      var cw = el('div', 'sxbot-chips');
      d.chips.forEach(function (c) { cw.appendChild(makeChip(c)); });
      row.appendChild(cw);
    }
    msgs.appendChild(row); scrollDown();
  }

  function showTyping() {
    var row = el('div', 'sxbot-row sxbot-bot sxbot-typing-row');
    var b = el('div', 'sxbot-bubble sxbot-typing');
    b.setAttribute('aria-label', 'المساعد يكتب');
    b.innerHTML = '<i></i><i></i><i></i>';
    row.appendChild(b); msgs.appendChild(row); scrollDown();
    return row;
  }

  function ask(query, shownText) {
    if (busy) return;
    addUser(shownText || query);
    busy = true;
    var typing = showTyping();
    var res = search(query);
    var dres = doctorAnswer(query);
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setTimeout(function () {
      if (typing.parentNode) typing.parentNode.removeChild(typing);
      if (dres) {
        addDoctors(dres);
      } else if (res.best) {
        addBot(res.best);
        if (res.related.length) {
          addBot(null, {
            text: ['قد يهمك أيضاً:'],
            chips: res.related.map(function (e) { return relatedLabel(e); })
          });
        }
      } else {
        addBot(null, { text: [FALLBACK_TEXT], chips: QUICK_CHIPS.concat(['جروبات الواتساب']) });
      }
      busy = false;
    }, reduce ? 0 : 450);
  }

  var RELATED_LABELS = {
    gpa: 'حاسبة المعدل', planning: 'لوحة التخطيط', materials: 'مصادر المواد', doctors: 'إيميلات الدكاترة',
    ai_tools: 'أدوات الذكاء الاصطناعي', presentation: 'أدوات AI للبرزنتيشن', opportunities: 'الفرص والمنح',
    courses: 'الكورسات المجانية', linkedin: 'دليل LinkedIn', orgs: 'المؤسسات المهنية', community: 'مجتمع الطلاب',
    whatsapp: 'جروبات الواتساب', about: 'من نحن', contact: 'التواصل مع الفريق', darkmode: 'الوضع الليلي',
    install: 'تثبيت المنصة كتطبيق', stu101: 'منصة Student 101', alhemmeh: 'منصة الهمة', uniflix: 'منصة Uniflix'
  };
  function relatedLabel(e) {
    var label = RELATED_LABELS[e.id] || e.id;
    CHIP_TO_QUERY[label] = e.kw[0];
    return label;
  }

  /* ---------- أسئلة الشريط السريع تُحوَّل لكلمات مفتاحية دقيقة ---------- */
  CHIP_TO_QUERY['حاسبة المعدل'] = 'حاسبة المعدل';
  CHIP_TO_QUERY['مصادر المواد'] = 'مصادر المواد';
  CHIP_TO_QUERY['أدوات AI للبرزنتيشن'] = 'برزنتيشن';
  CHIP_TO_QUERY['الفرص والمنح'] = 'منح';
  CHIP_TO_QUERY['لوحة التخطيط'] = 'لوحة التخطيط';
  CHIP_TO_QUERY['جروبات الواتساب'] = 'جروبات';
  CHIP_TO_QUERY['الكورسات المجانية'] = 'كورسات';
  CHIP_TO_QUERY['مجتمع الطلاب'] = 'مجتمع';
  CHIP_TO_QUERY['إيميلات الدكاترة'] = 'ايميلات الدكاترة';
  CHIP_TO_QUERY['أدوات الذكاء الاصطناعي'] = 'ادوات ai';
  CHIP_TO_QUERY['دليل LinkedIn'] = 'linkedin';
  CHIP_TO_QUERY['المؤسسات المهنية'] = 'مؤسسات مهنية';
  CHIP_TO_QUERY['من نحن'] = 'من نحن';
  CHIP_TO_QUERY['التواصل مع الفريق'] = 'تواصل معنا';
  CHIP_TO_QUERY['الوضع الليلي'] = 'الوضع الليلي';
  CHIP_TO_QUERY['تثبيت المنصة كتطبيق'] = 'تثبيت';

  /* ============================================================
   *  فتح/إغلاق + روابط الصفحة الحالية
   * ============================================================ */
  function setOpen(v) {
    isOpen = v;
    panel.classList.toggle('sxbot-open', v);
    fab.classList.toggle('sxbot-on', v);
    fab.classList.add('sxbot-seen');
    fab.setAttribute('aria-expanded', v ? 'true' : 'false');
    fab.setAttribute('aria-label', v ? 'إغلاق المساعد الذكي' : 'فتح المساعد الذكي');
    hint.classList.remove('sxbot-show');
    if (v) {
      if (!greeted) { greeted = true; welcome(); }
      setTimeout(function () { try { input.focus({ preventScroll: true }); } catch (e) { input.focus(); } }, 120);
      scrollDown();
    }
  }
  function toggle() { setOpen(!isOpen); }

  function welcome() {
    addBot(null, {
      text: ['أهلاً فيك في StudeX! 👋', 'أنا مساعدك الذكي. اسألني عن مصادر المواد، حاسبة المعدل، أدوات الذكاء الاصطناعي للبرزنتيشن، الفرص وغيرها.']
    });
  }

  function resetChat() {
    msgs.innerHTML = '';
    busy = false;
    welcome();
  }

  /* روابط ?open= و ?tab= تعمل مباشرة إذا كنا أصلاً بنفس الصفحة */
  function handleInternalLink(e, url) {
    var m = url.match(/^([^?#]+)(?:\?(.*))?$/);
    if (!m || m[1] !== currentFile()) return; // صفحة أخرى: تنقّل عادي
    var params = new URLSearchParams(m[2] || '');
    if (runDeepLink(params)) {
      e.preventDefault();
      setOpen(false);
    }
  }

  function runDeepLink(params) {
    var did = false;
    var open = params.get('open');
    var tab = params.get('tab');
    if (open && OPEN_TITLES[open] && typeof window.openItemsModal === 'function') {
      try { window.openItemsModal(open, OPEN_TITLES[open]); did = true; } catch (err) { /* تجاهل */ }
    }
    if (tab && typeof window.setSection === 'function') {
      try { window.setSection(tab); did = true; } catch (err2) { /* تجاهل */ }
    }
    return did;
  }

  function initDeepLinks() {
    var params = new URLSearchParams(location.search);
    if (!params.get('open') && !params.get('tab')) return;
    var go = function () { setTimeout(function () { runDeepLink(params); }, 350); };
    if (document.readyState === 'complete') go();
    else window.addEventListener('load', go);
  }

  function initHint() {
    var seen = false;
    try { seen = sessionStorage.getItem('studex-bot-hint') === '1'; } catch (e) { /* التخزين غير متاح */ }
    if (seen) { fab.classList.add('sxbot-seen'); return; }
    setTimeout(function () {
      if (isOpen) return;
      hint.classList.add('sxbot-show');
      try { sessionStorage.setItem('studex-bot-hint', '1'); } catch (e) { /* تجاهل */ }
      setTimeout(function () { hint.classList.remove('sxbot-show'); }, 6000);
    }, 3000);
  }

  function init() {
    injectStyles();
    build();
    initDeepLinks();
    initHint();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
