const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const bcrypt = require('bcrypt');
const supabase = require('./supabaseClient');

const students = [
    // Batch 1: BCA
    { scholar_id: '23145001', name: 'ADITYA SONI', class_name: 'BCA-5.5-SEM-VI', gender: 'M', mobile: '7489746991', email: 'adityasoni8835@gmail.com' },
    { scholar_id: '23145003', name: 'ASHUTOSH KUMAR', class_name: 'BCA-5.5-SEM-VI', gender: 'M', mobile: '9523852774', email: 'ashutoshdsvv99@gmail.com' },
    { scholar_id: '23145004', name: 'AYUSH RAM TRIPATHI', class_name: 'BCA-5.5-SEM-VI', gender: 'M', mobile: '8382860017', email: 'ayushramtripathi852@gmail.com' },
    { scholar_id: '23145005', name: 'BHASKAR MALL', class_name: 'BCA-5.5-SEM-VI', gender: 'M', mobile: '9455213359', email: 'mallbhaskar2001@gmail.com' },
    { scholar_id: '23145006', name: 'GOURI', class_name: 'BCA-5.5-SEM-VI', gender: 'F', mobile: '8791701274', email: 'gayutyagi13@gmail.com' },
    { scholar_id: '23145009', name: 'KANAK SHARMA', class_name: 'BCA-5.5-SEM-VI', gender: 'F', mobile: '9560469107', email: 'gauravromsons@hotmail.com' },
    { scholar_id: '23145011', name: 'KULDEEP SINGH', class_name: 'BCA-5.5-SEM-VI', gender: 'M', mobile: '9068774543', email: 'kuldeepsingh2982005@gmail.com' },
    { scholar_id: '23145027', name: 'MIKKI JAISWAL', class_name: 'BCA-5.5-SEM-VI', gender: 'F', mobile: '8102160135', email: 'Mikkijaiswal62Jam@gmail.com' },
    { scholar_id: '23145012', name: 'NISHA BHARTI', class_name: 'BCA-5.5-SEM-VI', gender: 'F', mobile: '9199780890', email: 'kauleshwardas01@gmail.com' },
    { scholar_id: '23145013', name: 'PRAGYA GUPTA', class_name: 'BCA-5.5-SEM-VI', gender: 'F', mobile: '8858477888', email: 'pragyag432@gmail.com' },
    { scholar_id: '23145014', name: 'PRATIK KUMAR SAH', class_name: 'BCA-5.5-SEM-VI', gender: 'M', mobile: '8982837746', email: 'Rinasoni7880@gmail.com' },
    { scholar_id: '23145018', name: 'RESHAB KHATIWADA', class_name: 'BCA-5.5-SEM-VI', gender: 'M', mobile: '6909544484', email: 'rishabhkhatiwada@gmail.com' },
    { scholar_id: '23145021', name: 'SAYON KOLEY', class_name: 'BCA-5.5-SEM-VI', gender: 'M', mobile: '8810394705', email: 'sayonkoley7@gmail.com' },
    { scholar_id: '23145028', name: 'SHREYA KASHYAP', class_name: 'BCA-5.5-SEM-VI', gender: 'F', mobile: '7983288211', email: 'shreyakashyap7564382@gmail.com' },
    { scholar_id: '23145022', name: 'SHREYA SINGH', class_name: 'BCA-5.5-SEM-VI', gender: 'F', mobile: '8235186053', email: 'Shreyasingh2881@gmail.com' },
    { scholar_id: '23145023', name: 'SONU RATHOR', class_name: 'BCA-5.5-SEM-VI', gender: 'M', mobile: '7417741174', email: 'ashysaini1234@gmail.com' },
    { scholar_id: '23145024', name: 'SUDHANSHU BELWAL', class_name: 'BCA-5.5-SEM-VI', gender: 'M', mobile: '8630297257', email: 'mohitpant61@gmail.com' },
    { scholar_id: '23145026', name: 'YADEV SINGH NISHAD', class_name: 'BCA-5.5-SEM-VI', gender: 'M', mobile: '7067780427', email: 'yadev94n@gmail.com' },
    // Batch 2: BSc IT
    { scholar_id: '23144003', name: 'AKANSHA RANA', class_name: 'BSC-IT-5.5-SEM-VI', gender: 'F', mobile: '7017654472', email: 'akansharajput1035@gmail.com' },
    { scholar_id: '23144025', name: 'AMAN PRATAP SINGH', class_name: 'BSC-IT-5.5-SEM-VI', gender: 'M', mobile: '7895694404', email: 'Amanpratapsingh889@gmail.com' },
    { scholar_id: '23144004', name: 'AMIT TIWARI', class_name: 'BSC-IT-5.5-SEM-VI', gender: 'M', mobile: '7488121910', email: 'tamit052004@gmail.com' },
    { scholar_id: '23144022', name: 'ARYAN TOMAR', class_name: 'BSC-IT-5.5-SEM-VI', gender: 'M', mobile: '8791985799', email: 'aryantmr55@gmail.com' },
    { scholar_id: '23144005', name: 'DEEPANSHI BHATT', class_name: 'BSC-IT-5.5-SEM-VI', gender: 'F', mobile: '8958636491', email: 'doonexcel0123@gmail.com' },
    { scholar_id: '23144006', name: 'DOLLY VERMA', class_name: 'BSC-IT-5.5-SEM-VI', gender: 'F', mobile: '9166365418', email: 'dv890639@gmail.com' },
    { scholar_id: '23144007', name: 'GAURAV DUNGRIYAL', class_name: 'BSC-IT-5.5-SEM-VI', gender: 'M', mobile: '9870608521', email: 'dungriyalgaurav08@gmail.com' },
    { scholar_id: '23144008', name: 'GHANAN DIXIT', class_name: 'BSC-IT-5.5-SEM-VI', gender: 'M', mobile: '9411604922', email: 'rajeshdixithathras@gmail.com' },
    { scholar_id: '23144009', name: 'GOURAV KUMAR', class_name: 'BSC-IT-5.5-SEM-VI', gender: 'M', mobile: '7488524756', email: 'gouravsharma16648@gmail.com' },
    { scholar_id: '23144010', name: 'MINAKSHI KUMARI', class_name: 'BSC-IT-5.5-SEM-VI', gender: 'F', mobile: '8102451059', email: 'minakshikumari824124@gmail.com' },
    { scholar_id: '23144011', name: 'MUKUND THAKUR', class_name: 'BSC-IT-5.5-SEM-VI', gender: 'M', mobile: '9643412039', email: 'thakurmukund84476@gmail.com' },
    { scholar_id: '23144023', name: 'PRAGYA MAURYA', class_name: 'BSC-IT-5.5-SEM-VI', gender: 'F', mobile: '9696204825', email: 'mauryarits87@gmail.com' },
    { scholar_id: '23144014', name: 'SAKSHI BANKHEDE', class_name: 'BSC-IT-5.5-SEM-VI', gender: 'F', mobile: '6263993828', email: 'sakshibankhedesakshi@gmail.com' },
    { scholar_id: '23144015', name: 'SAKSHI PAL', class_name: 'BSC-IT-5.5-SEM-VI', gender: 'F', mobile: '8954662428', email: 'rohanpal2418@gmail.com' },
    { scholar_id: '23144016', name: 'SANSKRITI AGRAWAL', class_name: 'BSC-IT-5.5-SEM-VI', gender: 'F', mobile: '8619099924', email: 'sanskritiagrawal0286@gmail.com' },
    { scholar_id: '23144017', name: 'SAROJ PODDAR', class_name: 'BSC-IT-5.5-SEM-VI', gender: 'M', mobile: '8145693415', email: 'poddarsaroj75@gmail.com' },
    { scholar_id: '23144018', name: 'SNEHA PAL', class_name: 'BSC-IT-5.5-SEM-VI', gender: 'F', mobile: '7017365366', email: 'rajkumarpal25781@gmail.com' },
    // New Students from Images
    // Page 1: BCA-4.5-SEM-II (Provided via JSON)
    { scholar_id: '2525292', name: 'ANIKET DHIMAN', class_name: 'BCA-4.5-SEM-II', gender: 'M', mobile: '9758762224', email: 'aniket.rke07@gmail.com' },
    { scholar_id: '2525281', name: 'APOORVA SRI', class_name: 'BCA-4.5-SEM-II', gender: 'F', mobile: '9971378149', email: 'apoorva2027@gmail.com' },
    { scholar_id: '2525297', name: 'ASTHA GUPTA', class_name: 'BCA-4.5-SEM-II', gender: 'F', mobile: '9415391396', email: 'rahulkumar6894@gmail.com' },
    { scholar_id: '2525291', name: 'DIKSHA', class_name: 'BCA-4.5-SEM-II', gender: 'F', mobile: '7568234561', email: 'dikshamali377@gmail.com' },
    { scholar_id: '2525279', name: 'GAURAV', class_name: 'BCA-4.5-SEM-II', gender: 'M', mobile: '9838233156', email: 'gauravrauniyar807@gmail.com' },
    { scholar_id: '2525335', name: 'GOURAV PANDIT', class_name: 'BCA-4.5-SEM-II', gender: 'M', mobile: '8130223483', email: 'rakeshpratibha2005@gmail.com' },
    { scholar_id: '2525289', name: 'MANISH KUMAR', class_name: 'BCA-4.5-SEM-II', gender: 'M', mobile: '8273996551', email: 'manishtyagi4you@gmail.com' },
    { scholar_id: '2525286', name: 'MOKSH RATHORE', class_name: 'BCA-4.5-SEM-II', gender: 'M', mobile: '7505217778', email: 'welegend7505@gmail.com' },
    { scholar_id: '2525295', name: 'NEHA PATEL', class_name: 'BCA-4.5-SEM-II', gender: 'F', mobile: '8982698376', email: 'thesolu134@gmail.com' },
    { scholar_id: '2525298', name: 'NIHAL UPADHYAY', class_name: 'BCA-4.5-SEM-II', gender: 'M', mobile: '8429925191', email: 'nihalupadhyay068@gmail.com' },
    { scholar_id: '2525302', name: 'NIKHIL KUMAR SINHA', class_name: 'BCA-4.5-SEM-II', gender: 'M', mobile: '7987909093', email: 'kpdew05@gmail.com' },
    { scholar_id: '2525282', name: 'OM KUMAR JHA', class_name: 'BCA-4.5-SEM-II', gender: 'M', mobile: '7739098908', email: 'om3479781@gmail.com' },
    { scholar_id: '2525293', name: 'PRAKASH KUMAR THAKUR', class_name: 'BCA-4.5-SEM-II', gender: 'M', mobile: '7255887573', email: 'thakurprakashkumar2008@gmail.com' },
    { scholar_id: '2525303', name: 'RAMYASREE RAJESH P', class_name: 'BCA-4.5-SEM-II', gender: 'F', mobile: '7902806042', email: 'remyasreerajesh007@gmail.com' },
    { scholar_id: '2525290', name: 'RISHIKA SRIVASTAVA', class_name: 'BCA-4.5-SEM-II', gender: 'F', mobile: '8299601310', email: 'rishikasrivasta299@gmail.com' },
    { scholar_id: '2525288', name: 'RUSHIKESH DEVENDRA NAKHALE', class_name: 'BCA-4.5-SEM-II', gender: 'M', mobile: '9273076939', email: 'nakhalerushikesh13@gmail.com' },
    { scholar_id: '2525367', name: 'SACHIN SINGH', class_name: 'BCA-4.5-SEM-II', gender: 'M', mobile: '7906874460', email: 'sachingandhar7@gmail.com' },
    { scholar_id: '2525368', name: 'SAHI RAM', class_name: 'BCA-4.5-SEM-II', gender: 'M', mobile: '7357149276', email: '29sahiramsiyak29@gmail.com' },
    { scholar_id: '2525301', name: 'SAKHI SACHDEV', class_name: 'BCA-4.5-SEM-II', gender: 'F', mobile: '9078114196', email: 'sakhisachdev4@gmail.com' },
    { scholar_id: '2525280', name: 'SATWIK KUMAR', class_name: 'BCA-4.5-SEM-II', gender: 'M', mobile: '9693651858', email: 'ajsinghmanu231@gmail.com' },
    { scholar_id: '2525294', name: 'SHIPRA SHARMA', class_name: 'BCA-4.5-SEM-II', gender: 'F', mobile: '9279703275', email: 'mioshisharma@gmail.com' },
    { scholar_id: '2525300', name: 'SHIVAM CHOUBEY', class_name: 'BCA-4.5-SEM-II', gender: 'M', mobile: '7870428768', email: 'schoubey469@gmail.com' },
    { scholar_id: '2525296', name: 'SHREYA KUMARI', class_name: 'BCA-4.5-SEM-II', gender: 'F', mobile: '6200256706', email: 'mangleshkumar299@gmail.com' },
    { scholar_id: '2525287', name: 'SNEHA ANAND', class_name: 'BCA-4.5-SEM-II', gender: 'F', mobile: '9650349597', email: 'itsmesnehaanand@gmail.com' },
    { scholar_id: '2525284', name: 'SUSHANT KUMAR', class_name: 'BCA-4.5-SEM-II', gender: 'M', mobile: '9334866003', email: 'sushantsinha7439@gmail.com' },
    // Page 2: BSC-IT-4.5-SEM-II (Provided via JSON)
    { scholar_id: '2525077', name: 'AARADHANA', class_name: 'BSC-IT-4.5-SEM-II', gender: 'F', mobile: '8882112445', email: 'surendraprasad211@gmail.com' },
    { scholar_id: '2525080', name: 'ADARSH BHARTI', class_name: 'BSC-IT-4.5-SEM-II', gender: 'M', mobile: '9122158172', email: 'adarshbharti0009@gmail.com' },
    { scholar_id: '2525085', name: 'AKANSHA CHAUDHARY', class_name: 'BSC-IT-4.5-SEM-II', gender: 'F', mobile: '8077525298', email: 'sunitasingh5009@gmail.com' },
    { scholar_id: '2525088', name: 'ARCHISHA SONI', class_name: 'BSC-IT-4.5-SEM-II', gender: 'F', mobile: '7415691178', email: 'preetisoninagda@gmail.com' },
    { scholar_id: '2525083', name: 'DEEPAK KUMAR', class_name: 'BSC-IT-4.5-SEM-II', gender: 'M', mobile: '8077831866', email: 'dk7778441@gmail.com' },
    { scholar_id: '2525091', name: 'GARIMA CHOUHAN', class_name: 'BSC-IT-4.5-SEM-II', gender: 'F', mobile: '7668981114', email: 'garimachouhan2206@gmail.com' },
    { scholar_id: '2525078', name: 'NEELAKSH SHARMA', class_name: 'BSC-IT-4.5-SEM-II', gender: 'M', mobile: '7248694475', email: 'neelakshsharma3105@gmail.com' },
    { scholar_id: '2525412', name: 'PAWAN KUMAR', class_name: 'BSC-IT-4.5-SEM-II', gender: 'M', mobile: '9616301420', email: 'nanupal334@gmail.com' },
    { scholar_id: '2525369', name: 'PRAGYA KUMARI', class_name: 'BSC-IT-4.5-SEM-II', gender: 'F', mobile: '6203979964', email: 'patelvivekkumar109@gmail.com' },
    { scholar_id: '2525089', name: 'PRATIBHA GOHE', class_name: 'BSC-IT-4.5-SEM-II', gender: 'F', mobile: '7000453359', email: 'pratibhamehra2008@gmail.com' },
    { scholar_id: '2525076', name: 'PRIYANSHU KUMAR', class_name: 'BSC-IT-4.5-SEM-II', gender: 'M', mobile: '8603283636', email: 'priyanshukumar3636130@gmail.com' },
    { scholar_id: '2525073', name: 'RAGHVENDER SINGH RANA', class_name: 'BSC-IT-4.5-SEM-II', gender: 'M', mobile: '7876248306', email: 'raghavrana0711@gmail.com' },
    { scholar_id: '2525075', name: 'SAJAL JOSHI', class_name: 'BSC-IT-4.5-SEM-II', gender: 'M', mobile: '9719893275', email: 'joshi.durga110@gmail.com' },
    { scholar_id: '2525081', name: 'SAJAL PRADHAN', class_name: 'BSC-IT-4.5-SEM-II', gender: 'M', mobile: '9575129951', email: 'arvindprakharasalansh24@gmail.com' },
    { scholar_id: '2525084', name: 'SAKSHI SHARMA', class_name: 'BSC-IT-4.5-SEM-II', gender: 'F', mobile: '9758860361', email: 'aarjunsharma111@gmail.com' },
    { scholar_id: '2525096', name: 'SAMEER SINGH CHAUHAN', class_name: 'BSC-IT-4.5-SEM-II', gender: 'M', mobile: '9825451440', email: 'sameersinghchauhan018@gmail.com' },
    { scholar_id: '2525095', name: 'SAURABH PANDEY', class_name: 'BSC-IT-4.5-SEM-II', gender: 'M', mobile: '8226936393', email: 'saurabhpanditddu.8226@gmail.com' },
    { scholar_id: '2525097', name: 'SHAURYA RAMGOPAL', class_name: 'BSC-IT-4.5-SEM-II', gender: 'M', mobile: '7037530324', email: 'shauryarg007@gmail.com' },
    { scholar_id: '2525090', name: 'SHIVAM YADAV', class_name: 'BSC-IT-4.5-SEM-II', gender: 'M', mobile: '9129810346', email: 'shivamyadav7485993@gmail.com' },
    { scholar_id: '2525074', name: 'SHRUTI BARANWAL', class_name: 'BSC-IT-4.5-SEM-II', gender: 'F', mobile: '9936927414', email: 'baranwalshruti0210@gmail.com' },
    { scholar_id: '2525086', name: 'SMITA RAJ', class_name: 'BSC-IT-4.5-SEM-II', gender: 'F', mobile: '9304690746', email: 'rsmita101@gmail.com' },
    { scholar_id: '2525082', name: 'STUTI MALIK', class_name: 'BSC-IT-4.5-SEM-II', gender: 'F', mobile: '9755290283', email: 'stutimalik2028@gmail.com' },
    { scholar_id: '2525092', name: 'VINEET KUMAR MISHRA', class_name: 'BSC-IT-4.5-SEM-II', gender: 'M', mobile: '8102852579', email: 'mishravineet8102@gmail.com' },
    { scholar_id: '2525094', name: 'VINEET KUMAR PADHAN', class_name: 'BSC-IT-4.5-SEM-II', gender: 'M', mobile: '8964909035', email: 'vineetpadhan21@gmail.com' },
    // Page 3: BCA-5-SEM-IV (Provided via JSON)
    { scholar_id: '2424380', name: 'AADYA GUPTA', class_name: 'BCA-5-SEM-IV', gender: 'F', mobile: '9450384856', email: 'sankalppgupta0739@gmail.com' },
    { scholar_id: '2424038', name: 'ABHISHEK KUMAR', class_name: 'BCA-5-SEM-IV', gender: 'M', mobile: '8507464221', email: 'peterprajapati1890@gmail.com' },
    { scholar_id: '2424219', name: 'AMRITANSH GUPTA', class_name: 'BCA-5-SEM-IV', gender: 'M', mobile: '8707368632', email: 'vedrishigupta333@gmail.com' },
    { scholar_id: '2424010', name: 'ASHUTOSH KUMAR', class_name: 'BCA-5-SEM-IV', gender: 'M', mobile: '-19628335492', email: 'ashu.maurya1101@gmail.com' },
    { scholar_id: '2424436', name: 'ATHARVA PATIDAR', class_name: 'BCA-5-SEM-IV', gender: 'M', mobile: '06262573753', email: 'patidaratharva03@gmail.com' },
    { scholar_id: '2424341', name: 'BHARAT ARORA', class_name: 'BCA-5-SEM-IV', gender: 'M', mobile: '7987853895', email: 'nehaarora0860@gmail.com' },
    { scholar_id: '2424327', name: 'DEBASHIS MUND', class_name: 'BCA-5-SEM-IV', gender: 'M', mobile: '9124945425', email: 'debashishmund557@gmail.com' },
    { scholar_id: '2424301', name: 'GOVIND MAURYA', class_name: 'BCA-5-SEM-IV', gender: 'M', mobile: '7408973532', email: 'govindmaurya7408@gmail.com' },
    { scholar_id: '2424100', name: 'GYAN PRAKASH CHAURASIYA', class_name: 'BCA-5-SEM-IV', gender: 'M', mobile: '9717454785', email: 'gyanpc1656@gmail.com' },
    { scholar_id: '2424438', name: 'KAUSHIK RAHUL WAGHMARE', class_name: 'BCA-5-SEM-IV', gender: 'M', mobile: '9226412724', email: 'kaushikwaghmare458@gmail.com' },
    { scholar_id: '2424288', name: 'KRISHNA SHARMA', class_name: 'BCA-5-SEM-IV', gender: 'M', mobile: '6395742605', email: 'krishna9837109914@gmail.com' },
    { scholar_id: '2424332', name: 'KSHITISHA DWIVEDI', class_name: 'BCA-5-SEM-IV', gender: 'F', mobile: '8858057336', email: 'kshitisha123@gmail.com' },
    { scholar_id: '2424050', name: 'NIKHIL KUMAR', class_name: 'BCA-5-SEM-IV', gender: 'M', mobile: '9816854989', email: 'nt3959367@gmail.com' },
    { scholar_id: '2424304', name: 'PREYANSHI SAHU', class_name: 'BCA-5-SEM-IV', gender: 'F', mobile: '6261204430', email: 'preyanshisahu@gmail.com' },
    { scholar_id: '2424213', name: 'PRITHVINATH M', class_name: 'BCA-5-SEM-IV', gender: 'M', mobile: '7356719802', email: 'prithvinath.m2006@gmail.com' },
    { scholar_id: '2424314', name: 'RASHMI SHRIVASTAV', class_name: 'BCA-5-SEM-IV', gender: 'F', mobile: '7897381532', email: 'rashmishrivastav166@gmail.com' },
    { scholar_id: '2424370', name: 'RISHIKESH PRIYADARSHI', class_name: 'BCA-5-SEM-IV', gender: 'M', mobile: '8935990880', email: 'rishikeshp290704@gmail.com' },
    { scholar_id: '2424053', name: 'RIYA VYAS', class_name: 'BCA-5-SEM-IV', gender: 'F', mobile: '9756392488', email: 'ajaykrvyas.dav@gmail.com' },
    { scholar_id: '2424096', name: 'SEM PRAKASH SAHU', class_name: 'BCA-5-SEM-IV', gender: 'M', mobile: '7773805272', email: 'semsahu32@gmail.com' },
    { scholar_id: '2424334', name: 'SHAILLY', class_name: 'BCA-5-SEM-IV', gender: 'F', mobile: '8923034110', email: 'divyadubey770@gmail.com' },
    { scholar_id: '2424418', name: 'SOURABH KUMAR', class_name: 'BCA-5-SEM-IV', gender: 'M', mobile: '6299839619', email: 'sourabhsaha6299839619@gmail.com' },
    // Page 4: BSC-IT-5-SEM-IV (Provided via JSON)
    { scholar_id: '2424140', name: 'AKHILESH PANDEY', class_name: 'BSC-IT-5-SEM-IV', gender: 'M', mobile: '8817596540', email: 'apandey12799@gmail.com' },
    { scholar_id: '2424296', name: 'AMRITA KUMARI', class_name: 'BSC-IT-5-SEM-IV', gender: 'F', mobile: '8340639186', email: 'amrita00m00@gmail.com' },
    { scholar_id: '2424113', name: 'ANKIT NAG', class_name: 'BSC-IT-5-SEM-IV', gender: 'M', mobile: '7017753914', email: 'ankitknv005@gmail.com' },
    { scholar_id: '2424345', name: 'GAYATRI KUMARI', class_name: 'BSC-IT-5-SEM-IV', gender: 'F', mobile: '9163830937', email: 'ramvilaspanditgp@gmail.com' },
    { scholar_id: '2424068', name: 'HEERA CHUGH', class_name: 'BSC-IT-5-SEM-IV', gender: 'M', mobile: '7011344423', email: 'heerachugh747@gmail.com' },
    { scholar_id: '2424433', name: 'HIMANSHU GANGWAR', class_name: 'BSC-IT-5-SEM-IV', gender: 'M', mobile: '7017923264', email: 'himanshugangwar876@gmail.com' },
    { scholar_id: '2424034', name: 'HRISHIKESH RANJAN', class_name: 'BSC-IT-5-SEM-IV', gender: 'M', mobile: '7352052863', email: 'hrishikesh2455@gmail.com' },
    { scholar_id: '2424379', name: 'MADHAVI MISHRA', class_name: 'BSC-IT-5-SEM-IV', gender: 'F', mobile: '6269479067', email: 'madhavihcm12@gmail.com' },
    { scholar_id: '2424253', name: 'MOHIT KUMAR', class_name: 'BSC-IT-5-SEM-IV', gender: 'M', mobile: '8571057311', email: 'dppant1998@gmail.com' },
    { scholar_id: '2424330', name: 'NAINSI TOMAR', class_name: 'BSC-IT-5-SEM-IV', gender: 'F', mobile: '9528040474', email: 'nainsitomar8@gmail.com' },
    { scholar_id: '2424044', name: 'NANDANI AGRAWAL', class_name: 'BSC-IT-5-SEM-IV', gender: 'M', mobile: '9784497275', email: 'nandaniagrawal3105@gmail.com' },
    { scholar_id: '2424159', name: 'PIYUSH', class_name: 'BSC-IT-5-SEM-IV', gender: 'M', mobile: '9977243897', email: 'piyushhanswal7080@gmail.com' },
    { scholar_id: '2424384', name: 'PRABHAT BHATT', class_name: 'BSC-IT-5-SEM-IV', gender: 'M', mobile: '9557490609', email: 'sanjaykumar28081982@gmail.com' },
    { scholar_id: '2424273', name: 'PRAGATI MAHAJAN', class_name: 'BSC-IT-5-SEM-IV', gender: 'F', mobile: '9131482759', email: 'mahajankrishna592@gmail.com' },
    { scholar_id: '2424307', name: 'PUJA KUMARI', class_name: 'BSC-IT-5-SEM-IV', gender: 'F', mobile: '8789331395', email: 'pk6252242@gmail.com' },
    { scholar_id: '2424063', name: 'RISHIKA', class_name: 'BSC-IT-5-SEM-IV', gender: 'F', mobile: '9027905015', email: 'gayakwadrishika8@gmail.com' },
    { scholar_id: '2424045', name: 'SHIVANSHU RASTOGI', class_name: 'BSC-IT-5-SEM-IV', gender: 'M', mobile: '9198193289', email: 'shivanshurastogi333@gmail.com' },
    { scholar_id: '2424065', name: 'SHRADDHA CHATURVEDI', class_name: 'BSC-IT-5-SEM-IV', gender: 'F', mobile: '9455426497', email: 'sadhna022607@gmail.com' },
    { scholar_id: '2424316', name: 'SHRADDHA SINGH', class_name: 'BSC-IT-5-SEM-IV', gender: 'F', mobile: '9927035340', email: 'shraddhasingh060402@gmail.com' },
    { scholar_id: '2424160', name: 'SUNNAM SANDEEP KUMAR', class_name: 'BSC-IT-5-SEM-IV', gender: 'M', mobile: '07879688088', email: 'sandeepdnt02@gmail.com' },
    { scholar_id: '2424360', name: 'VASUNDHARA KUMARI', class_name: 'BSC-IT-5-SEM-IV', gender: 'F', mobile: '8083932021', email: 'rdevi602106@gmail.com' },
    { scholar_id: '2424025', name: 'VISHAL KUMAR', class_name: 'BSC-IT-5-SEM-IV', gender: 'M', mobile: '70915288626', email: 'aasthakumaridavi@gmail.com' },
    { scholar_id: '2424251', name: 'YASHVINI RAJU DIGARSE', class_name: 'BSC-IT-5-SEM-IV', gender: 'F', mobile: '8982176070', email: 'DIGARSEYASHVINI@GMAIL.COM' },
    // Page 5: MCA-DS-SEM-II (Provided via JSON)
    { scholar_id: '2525200', name: 'ABHISHEK MAURYA', class_name: 'MCA-DS-SEM-II', gender: 'M', mobile: '7307909367', email: 'abhishekbreeza@gmail.con' },
    { scholar_id: '2525208', name: 'AMIT KUMAR', class_name: 'MCA-DS-SEM-II', gender: 'M', mobile: '9870835944', email: 'mmanisha76516@gmail.com' },
    { scholar_id: '2525201', name: 'ANSHIKA NOGAIN', class_name: 'MCA-DS-SEM-II', gender: 'F', mobile: '7417430340', email: 'anshikanogain3@gmail.com' },
    { scholar_id: '2525207', name: 'GAUTAM KUMAR TIWARY', class_name: 'MCA-DS-SEM-II', gender: 'M', mobile: '7488715091', email: 'gautamtiwary12055@gmail.com' },
    { scholar_id: '2525202', name: 'GAYATRI GAYAKWAD', class_name: 'MCA-DS-SEM-II', gender: 'F', mobile: '7803088587', email: 'gayatrigaykwad90@gmail.com' },
    { scholar_id: '2525197', name: 'JAYSHREE CHOUHAN', class_name: 'MCA-DS-SEM-II', gender: 'F', mobile: '9343550547', email: 'chouhanjayshree03@gmail.com' },
    { scholar_id: '2525203', name: 'NIKHIL KUMAR SHUKLA', class_name: 'MCA-DS-SEM-II', gender: 'M', mobile: '6306827179', email: 'nikhilshukla1200@gmail.com' },
    { scholar_id: '2525195', name: 'SACHIN', class_name: 'MCA-DS-SEM-II', gender: 'M', mobile: '7837218732', email: 'gssachinmaurya3000times@gmail.com' },
    { scholar_id: '2525198', name: 'TARANG BHARDWAJ', class_name: 'MCA-DS-SEM-II', gender: 'M', mobile: '8447097574', email: 'aerotarang2211@gmail.com' },
    { scholar_id: '2525204', name: 'VIVEK PATIDAR', class_name: 'MCA-DS-SEM-II', gender: 'M', mobile: '7566529195', email: 'patidarvivek333@gmail.com' }
];

async function seedStudents() {
    const DEFAULT_PASSWORD = 'Dsvv@123';
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(DEFAULT_PASSWORD, salt);

    console.log(`Starting to seed ${students.length} students...`);

    for (const student of students) {
        try {
            // Check if student already exists
            const { data: existingUser } = await supabase
                .from('users')
                .select('id')
                .eq('scholar_id', student.scholar_id)
                .single();

            if (existingUser) {
                console.log(`Student ${student.scholar_id} already exists. Skipping.`);
                continue;
            }

            const { error } = await supabase
                .from('users')
                .insert([
                    {
                        name: student.name,
                        scholar_id: student.scholar_id,
                        email: student.email,
                        password_hash,
                        role: 'student',
                        is_verified: true,
                        class_name: student.class_name,
                        gender: student.gender,
                        mobile: student.mobile
                    }
                ]);

            if (error) {
                console.error(`Error seeding student ${student.scholar_id}:`, error);
            } else {
                console.log(`Student ${student.scholar_id} seeded successfully.`);
            }
        } catch (err) {
            console.error(`Unexpected error for ${student.scholar_id}:`, err);
            console.error(err); // Show full error object
        }
    }
    console.log('Seeding process completed.');
}

seedStudents();
