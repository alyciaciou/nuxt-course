<script setup>
    definePageMeta({
        name: "profile",
    })

    const isEditPassword = ref(false)
    const isEditProfile = ref(false)
    const userData = ref(null)
    const authToken = useCookie("auth_token")

    // 密碼表單
    const passwordForm = reactive({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
    })

    // 生日相關資料
    const selectedYear = ref("")
    const selectedMonth = ref("")
    const selectedDay = ref("")

    // 地址相關資料
    const selectedCity = ref("高雄市")
    const selectedDistrict = ref("新興區")
    const addressDetail = ref("")

    // 基本資料表單
    const profileForm = reactive({
        name: "",
        phone: "",
    })

    // 錯誤訊息
    const errorMessage = ref("")
    const profileErrorMessage = ref("")

    // 城市選項
    const cities = ["臺北市", "臺中市", "高雄市"]

    // 區域選項
    const districts = {
        高雄市: ["前金區", "鹽埕區", "新興區"],
        // 可以根據需求添加其他城市的區域
    }

    // 格式化日期
    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return `${date.getFullYear()} 年 ${
            date.getMonth() + 1
        } 月 ${date.getDate()} 日`
    }

    // 初始化表單資料
    const initProfileForm = () => {
        if (userData.value) {
            profileForm.name = userData.value.name
            profileForm.phone = userData.value.phone

            // 解析生日
            const birthDate = new Date(userData.value.birthday)
            selectedYear.value = birthDate.getFullYear()
            selectedMonth.value = birthDate.getMonth() + 1
            selectedDay.value = birthDate.getDate()

            // 設定地址
            addressDetail.value = userData.value.address.detail
        }
    }

    // 獲取使用者資料
    const fetchUserData = async () => {
        try {
            const response = await $fetch(
                "https://freyja-s8qg.onrender.com/api/v1/user/",
                {
                    headers: {
                        Authorization: `Bearer ${authToken.value}`,
                    },
                }
            )
            userData.value = response.result
            initProfileForm()
        } catch (error) {
            console.error("獲取使用者資料失敗:", error)
        }
    }

    // 更新密碼
    const updatePassword = async () => {
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            errorMessage.value = "新密碼與確認密碼不符"
            return
        }

        try {
            await $fetch("https://freyja-s8qg.onrender.com/api/v1/user/", {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${authToken.value}`,
                    "Content-Type": "application/json",
                },
                body: {
                    userId: userData.value._id,
                    oldPassword: passwordForm.oldPassword,
                    newPassword: passwordForm.newPassword,
                },
            })

            isEditPassword.value = false
            errorMessage.value = ""
            passwordForm.oldPassword = ""
            passwordForm.newPassword = ""
            passwordForm.confirmPassword = ""
            alert("密碼更新成功！")
        } catch (error) {
            errorMessage.value = "密碼更新失敗，請確認舊密碼是否正確"
            console.error("更新密碼失敗:", error)
        }
    }

    // 更新基本資料
    const updateProfile = async () => {
        try {
            const formattedBirthday = `${selectedYear.value}/${selectedMonth.value}/${selectedDay.value}`

            const response = await $fetch(
                "https://freyja-s8qg.onrender.com/api/v1/user/",
                {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${authToken.value}`,
                        "Content-Type": "application/json",
                    },
                    body: {
                        userId: userData.value._id,
                        name: profileForm.name,
                        phone: profileForm.phone,
                        birthday: formattedBirthday,
                        address: {
                            zipcode: userData.value.address.zipcode,
                            detail: addressDetail.value,
                        },
                    },
                }
            )
            console.log(response)

            await fetchUserData()
            isEditProfile.value = false
            profileErrorMessage.value = ""
            alert("基本資料更新成功！")
        } catch (error) {
            profileErrorMessage.value = "更新基本資料失敗，請稍後再試"
            console.error("更新基本資料失敗:", error)
        }
    }

    // 計算密碼表單是否完整填寫
    const isPasswordFormValid = computed(() => {
        return (
            passwordForm.oldPassword &&
            passwordForm.newPassword &&
            passwordForm.confirmPassword
        )
    })

    onMounted(() => {
        fetchUserData()
    })
</script>

<template>
    <div class="row gap-6 gap-md-0" v-if="userData">
        <div class="col-12 col-md-5">
            <section
                class="rounded-3xl d-flex flex-column gap-6 gap-md-10 p-6 p-md-10 bg-neutral-0"
            >
                <h2 class="fs-6 fs-md-5 fw-bold">修改密碼</h2>
                <div class="d-flex flex-column gap-4 gap-md-6">
                    <div class="fs-8 fs-md-7">
                        <p class="mb-2 text-neutral-80 fw-medium">電子信箱</p>
                        <span
                            class="form-control pe-none p-0 text-neutral-100 fw-bold border-0"
                            >{{ userData.email }}</span
                        >
                    </div>

                    <div
                        class="d-flex justify-content-between align-items-center"
                        :class="{ 'd-none': isEditPassword }"
                    >
                        <div>
                            <label
                                class="mb-0 text-neutral-80 fs-8 fs-md-7 fw-medium"
                            >
                                密碼
                            </label>
                            <input
                                class="form-control pe-none p-0 text-neutral-100 fs-5 fs-md-3 fw-bold border-0"
                                type="password"
                                value="**********"
                            />
                        </div>

                        <button
                            class="flex-shrink-0 text-primary-100 fs-8 fs-md-7 fw-bold text-decoration-underline border-0 bg-transparent"
                            type="button"
                            @click="isEditPassword = !isEditPassword"
                        >
                            重設
                        </button>
                    </div>

                    <div v-if="errorMessage" class="alert alert-danger">
                        {{ errorMessage }}
                    </div>

                    <div
                        class="d-flex flex-column gap-4 gap-md-6"
                        :class="{ 'd-none': !isEditPassword }"
                    >
                        <div>
                            <label
                                for="oldPassword"
                                class="form-label fs-8 fs-md-7 fw-bold"
                                >舊密碼</label
                            >
                            <input
                                id="oldPassword"
                                v-model="passwordForm.oldPassword"
                                type="password"
                                class="form-control p-4 fs-7 rounded-3"
                                placeholder="請輸入舊密碼"
                            />
                        </div>

                        <div>
                            <label
                                for="newPassword"
                                class="form-label fs-8 fs-md-7 fw-bold"
                                >新密碼</label
                            >
                            <input
                                id="newPassword"
                                v-model="passwordForm.newPassword"
                                type="password"
                                class="form-control p-4 fs-7 rounded-3"
                                placeholder="請輸入新密碼"
                            />
                        </div>

                        <div>
                            <label
                                for="confirmPassword"
                                class="form-label fs-8 fs-md-7 fw-bold"
                                >確認新密碼</label
                            >
                            <input
                                id="confirmPassword"
                                v-model="passwordForm.confirmPassword"
                                type="password"
                                class="form-control p-4 fs-7 rounded-3"
                                placeholder="請再輸入一次新密碼"
                            />
                        </div>
                    </div>

                    <button
                        :class="{
                            'd-none': !isEditPassword,
                            'btn-primary-100': isPasswordFormValid,
                            'btn-neutral-40': !isPasswordFormValid,
                        }"
                        class="btn align-self-md-start px-8 py-4 rounded-3"
                        type="button"
                        @click="updatePassword"
                        :disabled="!isPasswordFormValid"
                    >
                        <span
                            :class="{
                                'text-neutral-0': isPasswordFormValid,
                                'text-neutral-60': !isPasswordFormValid,
                            }"
                        >
                            儲存設定
                        </span>
                    </button>
                </div>
            </section>
        </div>

        <div class="col-12 col-md-7">
            <section
                class="rounded-3xl d-flex flex-column gap-6 gap-md-10 p-6 p-md-10 bg-neutral-0"
            >
                <h2 class="fs-6 fs-md-5 fw-bold">基本資料</h2>

                <div v-if="profileErrorMessage" class="alert alert-danger">
                    {{ profileErrorMessage }}
                </div>

                <div class="d-flex flex-column gap-4 gap-md-6">
                    <!-- 姓名 -->
                    <div class="fs-8 fs-md-7">
                        <label
                            class="form-label"
                            :class="{
                                'fw-bold text-neutral-100': isEditProfile,
                                'fw-medium text-neutral-80': !isEditProfile,
                            }"
                            for="name"
                        >
                            姓名
                        </label>
                        <input
                            id="name"
                            v-model="profileForm.name"
                            class="form-control text-neutral-100 fw-bold"
                            :class="{
                                'pe-none p-0 border-0': !isEditProfile,
                                'p-4': isEditProfile,
                            }"
                            type="text"
                            :readonly="!isEditProfile"
                        />
                    </div>

                    <!-- 手機號碼 -->
                    <div class="fs-8 fs-md-7">
                        <label
                            class="form-label"
                            :class="{
                                'fw-bold text-neutral-100': isEditProfile,
                                'fw-medium text-neutral-80': !isEditProfile,
                            }"
                            for="phone"
                        >
                            手機號碼
                        </label>
                        <input
                            id="phone"
                            v-model="profileForm.phone"
                            class="form-control text-neutral-100 fw-bold"
                            :class="{
                                'pe-none p-0 border-0': !isEditProfile,
                                'p-4': isEditProfile,
                            }"
                            type="tel"
                            :readonly="!isEditProfile"
                        />
                    </div>

                    <!-- 生日 -->
                    <div class="fs-8 fs-md-7">
                        <label
                            class="form-label"
                            :class="{
                                'fw-bold text-neutral-100': isEditProfile,
                                'fw-medium text-neutral-80': !isEditProfile,
                            }"
                            for="birth"
                        >
                            生日
                        </label>
                        <span
                            class="form-control pe-none p-0 text-neutral-100 fw-bold border-0"
                            :class="{ 'd-none': isEditProfile }"
                            >{{ formatDate(userData.birthday) }}</span
                        >
                        <div
                            class="d-flex gap-2"
                            :class="{ 'd-none': !isEditProfile }"
                        >
                            <select
                                v-model="selectedYear"
                                id="birth"
                                class="form-select p-4 text-neutral-80 fw-medium rounded-3"
                            >
                                <option
                                    v-for="year in 65"
                                    :key="year"
                                    :value="year + 1958"
                                >
                                    {{ year + 1958 }} 年
                                </option>
                            </select>
                            <select
                                v-model="selectedMonth"
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
                                v-model="selectedDay"
                                class="form-select p-4 text-neutral-80 fw-medium rounded-3"
                            >
                                <option
                                    v-for="day in 31"
                                    :key="day"
                                    :value="day"
                                >
                                    {{ day }} 日
                                </option>
                            </select>
                        </div>
                    </div>

                    <!-- 地址 -->
                    <div class="fs-8 fs-md-7">
                        <label
                            class="form-label"
                            :class="{
                                'fw-bold text-neutral-100': isEditProfile,
                                'fw-medium text-neutral-80': !isEditProfile,
                            }"
                            for="address"
                        >
                            地址
                        </label>
                        <span
                            class="form-control pe-none p-0 text-neutral-100 fw-bold border-0"
                            :class="{ 'd-none': isEditProfile }"
                            >{{ userData.address.detail }}</span
                        >
                        <div :class="{ 'd-none': !isEditProfile }">
                            <div class="d-flex gap-2 mb-2">
                                <select
                                    v-model="selectedCity"
                                    class="form-select p-4 text-neutral-80 fw-medium rounded-3"
                                >
                                    <option
                                        v-for="city in cities"
                                        :key="city"
                                        :value="city"
                                    >
                                        {{ city }}
                                    </option>
                                </select>
                                <select
                                    v-model="selectedDistrict"
                                    class="form-select p-4 text-neutral-80 fw-medium rounded-3"
                                >
                                    <option
                                        v-for="district in districts[
                                            selectedCity
                                        ]"
                                        :key="district"
                                        :value="district"
                                    >
                                        {{ district }}
                                    </option>
                                </select>
                            </div>
                            <input
                                v-model="addressDetail"
                                id="address"
                                type="text"
                                class="form-control p-4 rounded-3"
                                placeholder="請輸入詳細地址"
                            />
                        </div>
                    </div>
                </div>

                <button
                    v-if="!isEditProfile"
                    class="btn btn-outline-primary-100 align-self-start px-8 py-4 rounded-3"
                    type="button"
                    @click="isEditProfile = true"
                >
                    編輯
                </button>

                <button
                    v-else
                    class="btn btn-primary-100 align-self-md-start px-8 py-4 text-neutral-0 rounded-3"
                    type="button"
                    @click="updateProfile"
                >
                    儲存設定
                </button>
            </section>
        </div>
    </div>
</template>

<style lang="scss" scoped>
    .rounded-3xl {
        border-radius: 1.25rem;
    }

    input[type="password"] {
        font: small-caption;
    }

    .form-control::placeholder {
        --neutral-60: #909090;
        color: var(--neutral-60);
        font-weight: 500;
    }
</style>
