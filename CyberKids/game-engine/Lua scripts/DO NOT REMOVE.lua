--TIMERSERVER

--local ReplicatedStorage = game:GetService("ReplicatedStorage")
--local StartTimer = ReplicatedStorage:WaitForChild("StartTimer")
--local StopTimer = ReplicatedStorage:WaitForChild("StopTimer")

--local startTime = nil
--local timerRunning = false

---- Function to get elapsed time
--local function getElapsedTime()
--	if not startTime then return 0 end
--	return math.floor(os.time() - startTime)
--end

---- Start the timer when the game starts
--game:BindToClose(function()
--	StopTimer:FireAllClients(getElapsedTime())
--end)

---- Optional: start timer when first player joins (or customize this logic)
--game.Players.PlayerAdded:Connect(function(player)
--	if not timerRunning then
--		startTime = os.time()
--		timerRunning = true
--		StartTimer:FireAllClients(startTime)
--	end
--end)

------------------------------------------------------------------------------------

--LOCALSCRIPT

--local ReplicatedStorage = game:GetService("ReplicatedStorage")
--local StartTimer = ReplicatedStorage:WaitForChild("StartTimer")
--local StopTimer = ReplicatedStorage:WaitForChild("StopTimer")

--local label = script.Parent
--local runService = game:GetService("RunService")

--local timerStart = 0
--local timerRunning = false

---- Format seconds into MM:SS
--local function formatTime(seconds)
--	local minutes = math.floor(seconds / 60)
--	local secs = seconds % 60
--	return string.format("%02d:%02d", minutes, secs)
--end

---- Update loop
--runService.RenderStepped:Connect(function()
--	if timerRunning then
--		local elapsed = os.time() - timerStart
--		label.Text = formatTime(elapsed)
--	end
--end)

--StartTimer.OnClientEvent:Connect(function(serverStartTime)
--	timerStart = serverStartTime
--	timerRunning = true
--end)

--StopTimer.OnClientEvent:Connect(function(finalElapsed)
--	label.Text = formatTime(finalElapsed)
--	timerRunning = false
--end)



