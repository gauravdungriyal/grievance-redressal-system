require('dotenv').config({ path: './server/.env' });
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
    { scholar_id: '23144018', name: 'SNEHA PAL', class_name: 'BSC-IT-5.5-SEM-VI', gender: 'F', mobile: '7017365366', email: 'rajkumarpal25781@gmail.com' }
];

async function seedStudents() {
    const DEFAULT_PASSWORD = 'Student@2025';
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
        }
    }
    console.log('Seeding process completed.');
}

seedStudents();
