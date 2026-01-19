
import React, { useEffect } from 'react';
import { ArrowLeft, Shield, FileText, Users } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

type PageType = 'about' | 'privacy' | 'terms';

const AboutContent = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <section className="space-y-4">
            <p className="text-xl font-light text-gray-600 leading-relaxed italic border-l-4 border-black pl-6">
                "Chúng tôi là một công ty nghiên cứu về AI với mục tiêu thay đổi tương lai của các chiến dịch thời trang và trải nghiệm của người tiêu dùng."
            </p>
        </section>

        <section className="space-y-4">
            <h2 className="text-2xl font-bold text-black flex items-center gap-3">
                <span className="w-8 h-px bg-black"></span> Tầm nhìn
            </h2>
            <p className="text-gray-700 leading-relaxed">
                Chúng tôi tin rằng AI có thể chuyển đổi cách thời trang được sáng tạo, trình diễn và trải nghiệm — giúp quá trình thiết kế trở nên dễ tiếp cận hơn và việc trực quan hóa trở nên đơn giản cho mọi đối tượng trong ngành.
            </p>
        </section>

        <section className="space-y-4">
            <h2 className="text-2xl font-bold text-black flex items-center gap-3">
                <span className="w-8 h-px bg-black"></span> Sứ mệnh
            </h2>
            <p className="text-gray-700 leading-relaxed">
                Mentoris AI Super Studio là một công ty tự đầu tư, lấy AI làm trung tâm, tập trung nghiên cứu các mô hình sinh ảnh dựa trên AI được thiết kế chuyên biệt cho ngành thời trang. Sứ mệnh của chúng tôi là biến việc trực quan hóa thời trang trở nên đơn giản và dễ tiếp cận như thao tác sao chép – dán, trao quyền cho các thương hiệu, nhà thiết kế và đội ngũ marketing tạo ra, trình bày và cá nhân hóa nội dung thời trang một cách effortless.
            </p>
            <p className="text-gray-700 leading-relaxed">
                Chúng tôi phát triển các mô hình AI độc quyền phục vụ cho thử đồ ảo, người mẫu thời trang do AI tạo ra và tạo mockup sản phẩm, cho phép xây dựng nội dung liền mạch cho thương mại điện tử, mạng xã hội và mua sắm trực tuyến. Chúng tôi liên tục mở rộng giới hạn của AI, đảm bảo công nghệ tạo ra hình ảnh chất lượng cao, chân thực, đồng thời vẫn trực quan và dễ sử dụng.
            </p>
        </section>

        <section className="space-y-4">
            <h2 className="text-2xl font-bold text-black flex items-center gap-3">
                <span className="w-8 h-px bg-black"></span> Giải pháp & Giá trị
            </h2>
            <p className="text-gray-700 leading-relaxed">
                Giải pháp của chúng tôi giúp nhà thiết kế trực quan hóa ngay lập tức các sáng tạo của mình — cho phép xem trước họa tiết, hoa văn và phong cách khi hiển thị trên người mẫu trước khi sản xuất. Đội ngũ marketing có thể tạo ra các chiến dịch thời trang cá nhân hóa, đúng nhận diện thương hiệu ở quy mô lớn, dễ dàng điều chỉnh hình ảnh cho nhiều tệp khách hàng khác nhau.
            </p>
            <p className="text-gray-700 leading-relaxed">
                Tại Mentoris AI Super Studio, chúng tôi tin rằng AI nên nâng tầm sự sáng tạo, chứ không thay thế nó. Chúng tôi cam kết đổi mới có trách nhiệm, đảm bảo công nghệ được phát triển một cách đạo đức và triển khai cẩn trọng.
            </p>
        </section>
    </div>
);

const TermsContent = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 text-sm md:text-base">
        <p className="text-gray-500 italic">Cập nhật lần cuối: 18.01.2026</p>
        <p className="text-gray-700">
            Chào mừng bạn đến với Mentoris AI Super Studio. Khi truy cập hoặc sử dụng nền tảng, website hoặc các dịch vụ của chúng tôi, bạn đồng ý tuân thủ và bị ràng buộc bởi Thỏa thuận người dùng này. Nếu bạn không đồng ý với các điều khoản dưới đây, bạn không được phép sử dụng Dịch vụ.
        </p>

        <div className="space-y-2">
            <h3 className="font-bold text-black uppercase tracking-wider">1. Điều kiện sử dụng</h3>
            <ul className="list-disc pl-5 space-y-1 text-gray-700">
                <li>Bạn phải đủ 18 tuổi (hoặc đủ độ tuổi thành niên theo quy định pháp luật tại nơi bạn sinh sống) để sử dụng Dịch vụ.</li>
                <li>Bằng việc sử dụng Dịch vụ, bạn xác nhận rằng mình có đầy đủ năng lực pháp lý để ký kết và thực hiện Thỏa thuận này.</li>
            </ul>
        </div>

        <div className="space-y-2">
            <h3 className="font-bold text-black uppercase tracking-wider">2. Đăng ký tài khoản</h3>
            <ul className="list-disc pl-5 space-y-1 text-gray-700">
                <li>Để truy cập một số tính năng nhất định, bạn có thể cần tạo tài khoản.</li>
                <li>Bạn phải cung cấp thông tin chính xác, đầy đủ và bảo mật thông tin đăng nhập của mình.</li>
                <li>Bạn chịu trách nhiệm cho mọi hoạt động phát sinh dưới tài khoản của mình.</li>
            </ul>
        </div>

        <div className="space-y-2">
            <h3 className="font-bold text-black uppercase tracking-wider">3. Dịch vụ</h3>
            <p className="text-gray-700">Mentoris AI Super Studio cung cấp các dịch vụ tạo hình ảnh và video ứng dụng AI, cho phép bạn:</p>
            <ul className="list-disc pl-5 space-y-1 text-gray-700">
                <li>Tải lên hình ảnh sản phẩm.</li>
                <li>Áp dụng hình ảnh lên người mẫu ảo.</li>
                <li>Tạo các tài sản trực quan (hình ảnh và video).</li>
            </ul>
            <p className="text-gray-700 mt-2">Chúng tôi có quyền cập nhật, điều chỉnh hoặc ngừng cung cấp bất kỳ tính năng nào theo quyết định của mình.</p>
        </div>

        <div className="space-y-2">
            <h3 className="font-bold text-black uppercase tracking-wider">4. Nội dung người dùng</h3>
            <ul className="list-disc pl-5 space-y-1 text-gray-700">
                <li><strong>Quyền sở hữu:</strong> Bạn vẫn giữ quyền sở hữu đối với tất cả hình ảnh, video và nội dung bạn tải lên (“Nội dung người dùng”).</li>
                <li><strong>Cấp phép cho chúng tôi:</strong> Khi tải nội dung lên, bạn cấp cho chúng tôi quyền sử dụng có giới hạn, không độc quyền, trên toàn cầu để xử lý, hiển thị và lưu trữ Nội dung người dùng chỉ nhằm mục đích cung cấp Dịch vụ.</li>
                <li><strong>Trách nhiệm:</strong> Bạn hoàn toàn chịu trách nhiệm đối với Nội dung người dùng và đảm bảo rằng bạn có đầy đủ quyền và sự cho phép cần thiết để sử dụng nội dung đó. Bạn cam kết không tải lên nội dung trái pháp luật, gây hại hoặc xâm phạm quyền của bên thứ ba.</li>
            </ul>
        </div>

        <div className="space-y-2">
            <h3 className="font-bold text-black uppercase tracking-wider">5. Nội dung được tạo</h3>
            <ul className="list-disc pl-5 space-y-1 text-gray-700">
                <li>Nội dung do Mentoris AI Super Studio tạo ra từ dữ liệu bạn tải lên được cấp cho bạn quyền sử dụng cho mục đích thương mại và phi thương mại, trừ khi có quy định khác.</li>
                <li>Bạn chịu trách nhiệm đảm bảo việc sử dụng nội dung được tạo tuân thủ các quy định pháp luật về sở hữu trí tuệ và quyền của bên thứ ba.</li>
            </ul>
        </div>

        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-2">
            <h3 className="font-bold text-black text-sm uppercase">Liên hệ Pháp lý</h3>
            <p className="text-gray-700 text-sm">
                Nếu bạn có câu hỏi liên quan đến Thỏa thuận này, vui lòng liên hệ:<br/>
                <strong>Email:</strong> mentoirs.studio@gmail.com<br/>
                <strong>Website:</strong> www.mentoris.studio
            </p>
        </div>
    </div>
);

const PrivacyContent = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 text-sm md:text-base">
        <p className="text-gray-500 italic">Cập nhật lần cuối: 18.01.2026</p>
        <p className="text-gray-700">
            Mentoris AI Super Studio tôn trọng quyền riêng tư của bạn và cam kết bảo vệ quyền riêng tư đó thông qua Chính sách quyền riêng tư này. Chính sách này giải thích cách chúng tôi thu thập, sử dụng, chia sẻ và bảo vệ thông tin của bạn khi bạn sử dụng nền tảng, website và các dịch vụ liên quan.
        </p>

        <div className="space-y-3">
            <h3 className="font-bold text-black uppercase tracking-wider">1. Thông tin chúng tôi thu thập</h3>
            <div className="pl-4 border-l-2 border-gray-200 space-y-2">
                <p className="font-bold text-gray-900">a. Thông tin bạn cung cấp</p>
                <ul className="list-disc pl-5 text-gray-700 text-sm">
                    <li><strong>Thông tin tài khoản:</strong> Họ tên, địa chỉ email, thông tin công ty, thông tin thanh toán.</li>
                    <li><strong>Nội dung tải lên:</strong> Hình ảnh sản phẩm, video hoặc các tài sản sáng tạo khác mà bạn tải lên để xử lý.</li>
                    <li><strong>Thông tin liên lạc:</strong> Tin nhắn, phản hồi hoặc yêu cầu hỗ trợ.</li>
                </ul>
            </div>
            <div className="pl-4 border-l-2 border-gray-200 space-y-2">
                <p className="font-bold text-gray-900">b. Thông tin được thu thập tự động</p>
                <ul className="list-disc pl-5 text-gray-700 text-sm">
                    <li>Dữ liệu sử dụng: Tệp nhật ký, địa chỉ IP, loại trình duyệt, loại thiết bị.</li>
                    <li>Cookie và công nghệ theo dõi để cải thiện trải nghiệm.</li>
                </ul>
            </div>
        </div>

        <div className="space-y-2">
            <h3 className="font-bold text-black uppercase tracking-wider">2. Cách chúng tôi sử dụng thông tin</h3>
            <ul className="list-disc pl-5 space-y-1 text-gray-700">
                <li>Cung cấp, vận hành và cải thiện Dịch vụ.</li>
                <li>Xử lý và trả kết quả hình ảnh, video bạn tải lên.</li>
                <li>Liên hệ với bạn về các cập nhật, hỗ trợ và thông tin quảng bá (khi được phép).</li>
                <li>Phân tích hành vi sử dụng và xu hướng để cải thiện trải nghiệm người dùng.</li>
                <li>Tuân thủ các nghĩa vụ pháp lý.</li>
            </ul>
        </div>

        <div className="space-y-2">
            <h3 className="font-bold text-black uppercase tracking-wider">3. Chia sẻ thông tin</h3>
            <p className="text-gray-700">Chúng tôi không bán thông tin cá nhân của bạn. Chúng tôi có thể chia sẻ thông tin với:</p>
            <ul className="list-disc pl-5 space-y-1 text-gray-700">
                <li><strong>Nhà cung cấp dịch vụ:</strong> Các đối tác hỗ trợ vận hành (lưu trữ đám mây, xử lý thanh toán).</li>
                <li><strong>Yêu cầu pháp lý:</strong> Khi được yêu cầu theo quy định pháp luật.</li>
            </ul>
        </div>

        <div className="space-y-2">
            <h3 className="font-bold text-black uppercase tracking-wider">4. Thời gian lưu trữ</h3>
            <p className="text-gray-700">
                Chúng tôi chỉ lưu trữ thông tin cá nhân của bạn trong thời gian cần thiết để thực hiện các mục đích nêu trong Chính sách này. Hình ảnh tải lên và nội dung được tạo có thể bị xóa sau khi xử lý hoặc được lưu trữ theo cài đặt tài khoản của bạn.
            </p>
        </div>

        <div className="space-y-2">
            <h3 className="font-bold text-black uppercase tracking-wider">5. Quyền của bạn</h3>
            <p className="text-gray-700">Tùy theo vị trí địa lý, bạn có quyền truy cập, chỉnh sửa, xóa thông tin cá nhân, hoặc từ chối nhận tin tiếp thị. Để thực hiện, vui lòng liên hệ: <span className="font-bold text-black">mentoirs.studio@gmail.com</span></p>
        </div>
    </div>
);

export const StaticPage = ({ type }: { type: PageType }) => {
    const { setViewMode } = useApp();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [type]);

    const getConfig = () => {
        switch (type) {
            case 'about':
                return { title: 'Về Chúng Tôi', icon: Users, component: <AboutContent /> };
            case 'privacy':
                return { title: 'Chính Sách Quyền Riêng Tư', icon: Shield, component: <PrivacyContent /> };
            case 'terms':
                return { title: 'Thỏa Thuận Người Dùng', icon: FileText, component: <TermsContent /> };
        }
    };

    const config = getConfig();

    return (
        <div className="min-h-screen bg-white pt-24 pb-20">
            {/* Header / Nav */}
            <div className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center px-6 z-50">
                <button 
                    onClick={() => setViewMode('landing')}
                    className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-black transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" /> Quay lại Trang chủ
                </button>
            </div>

            <div className="max-w-3xl mx-auto px-6">
                <div className="mb-12 text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <config.icon className="w-8 h-8 text-black" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">{config.title}</h1>
                    <div className="w-20 h-1.5 bg-[#66E91E] mx-auto rounded-full"></div>
                </div>

                <div className="prose prose-lg max-w-none prose-headings:font-bold prose-a:text-black hover:prose-a:text-[#66E91E]">
                    {config.component}
                </div>
            </div>
        </div>
    );
};
