<script setup>
    import { Icon } from "@iconify/vue"

    const isEmailAndPasswordValid = ref(false)
    const email = ref("")
    const password = ref("")
    const confirmPassword = ref("")
    const name = ref("")
    const phone = ref("")
    const birthYear = ref("")
    const birthMonth = ref("")
    const birthDay = ref("")
    const city = ref("")
    const district = ref("")
    const address = ref("")
    const isChecked = ref(false)

    const router = useRouter()

    const isConfirm = computed(() => {
        const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return (
            pattern.test(email.value) &&
            password.value.length >= 6 &&
            password.value === confirmPassword.value
        )
    })

    const nextStep = () => {
        isConfirm.value
            ? (isEmailAndPasswordValid.value = true)
            : alert("請確認電子郵件格式正確，密碼一致且至少6個字元")
    }
    const signup = async () => {
        if (!isChecked.value) {
            alert("請閱讀並勾選同意個資使用規範！")
            return
        }

        if (password.value !== confirmPassword.value) {
            alert("密碼與確認密碼不一致！")
            return
        }

        const info = {
            name: name.value,
            email: email.value,
            password: password.value,
            phone: phone.value,
            birthday: `${birthYear.value}/${birthMonth.value}/${birthDay.value}`,
            address: {
                zipcode: 802,
                detail: "文山路23號",
            },
        }

        try {
            const response = await $fetch(
                "https://localhost:3005/api/v1/user/signup",
                {
                    method: "POST",
                    body: info,
                }
            )
            console.log(response)

            // 根據返回結果判斷
            if (response.status) {
                alert("註冊成功！即將跳轉到登入頁面")
                router.push("/account/login")
            } else {
                alert(`註冊失敗：${response.message}`)
            }
        } catch (error) {
            console.error("註冊過程中發生錯誤：", error)
            alert("註冊失敗，請稍後再試！")
        }
    }
</script>

<template>
    <div class="p-5 px-md-0 py-md-30">
        <div class="mb-10">
            <p class="mb-2 text-primary-100 fs-8 fs-md-7 fw-bold">
                享樂酒店，誠摯歡迎
            </p>
            <h1 class="mb-4 text-neutral-0 fw-bold">立即註冊</h1>

            <div class="d-flex align-items-center py-4 gap-2">
                <div
                    class="d-flex flex-column align-items-center gap-1 text-neutral-0"
                >
                    <span
                        :class="{ 'd-none': isEmailAndPasswordValid }"
                        class="step p-2 bg-primary-100 rounded-circle"
                        >1</span
                    >
                    <Icon
                        :class="{ 'd-none': !isEmailAndPasswordValid }"
                        class="p-2 fs-3 bg-primary-100 rounded-circle"
                        icon="material-symbols:check"
                    />
                    <p class="mb-0 fs-8 fs-md-7 fw-bold">輸入信箱及密碼</p>
                </div>

                <hr
                    class="flex-grow-1 my-0 border border-neutral-60 opacity-100"
                />

                <div
                    :class="{
                        'text-neutral-0': isEmailAndPasswordValid,
                        'text-neutral-60': !isEmailAndPasswordValid,
                    }"
                    class="d-flex flex-column align-items-center gap-1"
                >
                    <span
                        :class="{
                            'bg-primary-100': isEmailAndPasswordValid,
                            'bg-transparent border border-neutral-60':
                                !isEmailAndPasswordValid,
                        }"
                        class="step p-2 rounded-circle"
                        >2</span
                    >
                    <p class="mb-0 fs-8 fs-md-7 fw-bold">填寫基本資料</p>
                </div>
            </div>
        </div>

        <div class="mb-4">
            <form :class="{ 'd-none': isEmailAndPasswordValid }" class="mb-4">
                <div class="mb-4 fs-8 fs-md-7">
                    <label class="mb-2 text-neutral-0 fw-bold" for="email">
                        電子信箱
                    </label>
                    <input
                        v-model="email"
                        id="email"
                        class="form-control p-4 text-neutral-100 fw-medium border-neutral-40"
                        placeholder="hello@exsample.com"
                        type="email"
                    />
                </div>
                <div class="mb-4 fs-8 fs-md-7">
                    <label class="mb-2 text-neutral-0 fw-bold" for="password">
                        密碼
                    </label>
                    <input
                        v-model="password"
                        id="password"
                        class="form-control p-4 text-neutral-100 fw-medium border-neutral-40"
                        placeholder="請輸入密碼"
                        type="password"
                        maxlength="128"
                    />
                </div>
                <div class="mb-10 fs-8 fs-md-7">
                    <label
                        class="mb-2 text-neutral-0 fw-bold"
                        for="confirmPassword"
                    >
                        確認密碼
                    </label>
                    <input
                        v-model="confirmPassword"
                        id="confirmPassword"
                        class="form-control p-4 text-neutral-100 fw-medium border-neutral-40"
                        placeholder="請再輸入一次密碼"
                        type="password"
                        maxlength="128"
                    />
                </div>
                <button
                    :class="{
                        'btn-primary-100 text-neutral-0': isConfirm,
                        'btn-neutral-40 text-neutral-60': !isConfirm,
                    }"
                    class="btn w-100 py-4 fw-bold"
                    type="button"
                    @click="nextStep"
                    :disabled="!isConfirm"
                >
                    下一步
                </button>
            </form>
            <form :class="{ 'd-none': !isEmailAndPasswordValid }" class="mb-4">
                <div class="mb-4 fs-8 fs-md-7">
                    <label class="mb-2 text-neutral-0 fw-bold" for="name">
                        姓名
                    </label>
                    <input
                        v-model="name"
                        id="name"
                        class="form-control p-4 text-neutral-100 fw-medium border-neutral-40 rounded-3"
                        placeholder="請輸入姓名"
                        type="text"
                    />
                </div>
                <div class="mb-4 fs-8 fs-md-7">
                    <label class="mb-2 text-neutral-0 fw-bold" for="phone">
                        手機號碼
                    </label>
                    <input
                        v-model="phone"
                        id="phone"
                        class="form-control p-4 text-neutral-100 fw-medium border-neutral-40 rounded-3"
                        placeholder="請輸入手機號碼"
                        type="tel"
                    />
                </div>
                <div class="mb-4 fs-8 fs-md-7">
                    <label class="mb-2 text-neutral-0 fw-bold" for="birth">
                        生日
                    </label>
                    <div class="d-flex gap-2">
                        <select
                            v-model="birthYear"
                            id="birth"
                            class="form-select p-4 text-neutral-80 fw-medium rounded-3"
                        >
                            <option
                                v-for="year in 61"
                                :key="year"
                                :value="year + 1963"
                            >
                                {{ year + 1963 }} 年
                            </option>
                        </select>
                        <select
                            v-model="birthMonth"
                            class="form-select p-4 text-neutral-80 fw-medium rounded-3"
                        >
                            <option
                                v-for="month in 12"
                                :key="month"
                                :value="month"
                            >
                                {{ month }} 月
                            </option>
                        </select>
                        <select
                            v-model="birthDay"
                            class="form-select p-4 text-neutral-80 fw-medium rounded-3"
                        >
                            <option v-for="day in 30" :key="day" :value="day">
                                {{ day }} 日
                            </option>
                        </select>
                    </div>
                </div>
                <div class="mb-4 fs-8 fs-md-7">
                    <label
                        class="form-label text-neutral-0 fw-bold"
                        for="address"
                    >
                        地址
                    </label>
                    <div>
                        <div class="d-flex gap-2 mb-2">
                            <select
                                v-model="city"
                                class="form-select p-4 text-neutral-80 fw-medium rounded-3"
                            >
                                <option value="臺北市">臺北市</option>
                                <option value="臺中市">臺中市</option>
                                <option selected value="高雄市">高雄市</option>
                            </select>
                            <select
                                v-model="district"
                                class="form-select p-4 text-neutral-80 fw-medium rounded-3"
                            >
                                <option value="330">前金區</option>
                                <option value="330">鹽埕區</option>
                                <option selected value="330">新興區</option>
                            </select>
                        </div>
                        <input
                            v-model="address"
                            id="address"
                            type="text"
                            class="form-control p-4 rounded-3"
                            placeholder="請輸入詳細地址"
                        />
                    </div>
                </div>

                <div
                    class="form-check d-flex align-items-end gap-2 mb-10 text-neutral-0"
                >
                    <input
                        v-model="isChecked"
                        id="agreementCheck"
                        class="form-check-input"
                        type="checkbox"
                        value=""
                    />
                    <label
                        class="form-check-label fw-bold"
                        for="agreementCheck"
                    >
                        我已閱讀並同意本網站個資使用規範
                    </label>
                </div>
                <button
                    @click="signup"
                    class="btn btn-primary-100 w-100 py-4 text-neutral-0 fw-bold"
                    type="button"
                >
                    完成註冊
                </button>
            </form>
        </div>

        <p class="mb-0 fs-8 fs-md-7">
            <span class="me-2 text-neutral-0 fw-medium">已經有會員了嗎？</span>
            <NuxtLink
                to="/account/login"
                class="text-primary-100 fw-bold text-decoration-underline bg-transparent border-0"
            >
                <span>立即登入</span>
            </NuxtLink>
        </p>
    </div>
</template>

<style lang="scss" scoped>
    @import "bootstrap/scss/mixins/breakpoints";

    $grid-breakpoints: (
        xs: 0,
        sm: 576px,
        md: 768px,
        lg: 992px,
        xl: 1200px,
        xxl: 1400px,
        xxxl: 1537px,
    );

    input[type="password"] {
        font: small-caption;
        font-size: 1.5rem;
    }

    input::placeholder {
        color: #909090;
        font-size: 1rem;
        font-weight: 500;

        @include media-breakpoint-down(md) {
            font-size: 14px;
        }
    }

    .form-check-input {
        width: 1.5rem;
        height: 1.5rem;
    }

    .form-check-input:checked {
        background-color: #bf9d7d;
        border-color: #bf9d7d;
    }

    .step {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 32px;
        height: 32px;
    }
</style>
